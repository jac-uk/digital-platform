import { getDocument, getDocuments, applyUpdates } from '../shared/helpers.js';
import initFactories from '../shared/factories.js';
import initLogEvent from './logs/logEvent.js';
import initRefreshApplicationCounts from '../actions/exercises/refreshApplicationCounts.js';

export default (firebase, db, auth) => {
  const { newApplicationRecord } = initFactories();
  const { logEvent } = initLogEvent(firebase, db, auth);
  const { refreshApplicationCounts } = initRefreshApplicationCounts(firebase, db);

  return {
    initialiseApplicationRecords,  // @TODO this will be removed once we have database triggers turned on *and* existing exercises have been initialised
    initialiseMissingApplicationRecords,  // @TODO this will be removed once we have database triggers turned on *and* existing exercises have been initialised
    onApplicationRecordUpdate,
  };

  function getExercise(exerciseId) {
    return getDocument(db.collection('exercises').doc(exerciseId));
  }

  function isTestApplication(application) {
    return application.personalDetails && application.personalDetails.email.indexOf('@judicialappointments.digital') > 0;
  }

  async function onApplicationRecordUpdate(dataBefore, dataAfter) {
    // update application with stage/status changes (part of admin#1341 Staged Applications)
    if (dataBefore.stage !== dataAfter.stage || dataBefore.status !== dataAfter.status) {
      const applicationData = {};
      applicationData['_processing.stage'] = dataAfter.stage;
      applicationData['_processing.status'] = dataAfter.status;
      if (dataBefore.application) {
        await db.doc(`applications/${dataBefore.application.id}`).update(applicationData);
        // activity log
        logEvent('info', 'Application status/stage changed', {
          applicationId: dataAfter.application.id,
          candidateName: dataAfter.candidate.fullName,
          exerciseRef: dataAfter.exercise.referenceNumber,
          status: dataAfter.status,
          stage: dataAfter.stage,
          empApplied: dataAfter.flags.empApplied,
        });
      }
    }

    // check for candidate form response status changes
    const supportedCandidateForms = [ 'preSelectionDayQuestionnaire' ];
    supportedCandidateForms.forEach(async form => {
      if (dataAfter[form]) {  // form is relevant
        if (!dataBefore[form] || (dataBefore[form] && dataBefore[form].status !== dataAfter[form].status)) {  // status has been introduced or changed
          const applicationData = {};
          applicationData[form] = dataAfter[form];
          await db.doc(`applications/${dataBefore.application.id}`).update(applicationData);
        }
      }
    });

    return true;
  }

  /**
  * initialiseApplicationRecords
  * Creates applicationRecords for each application in an exercise
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  */
  async function initialiseApplicationRecords(params) {
    // get exercise
    const exercise = await getExercise(params.exerciseId);

    // exit if already initialised application records
    if (exercise._applicationRecords && exercise._applicationRecords.total) {
      return false;
    }

    // get applications
    let applicationsRef = db.collection('applications')
      .where('exerciseId', '==', params.exerciseId);
    const applications = await getDocuments(applicationsRef);
    const appliedApplications = applications.filter(application => application.status === 'applied');

    // construct db commands
    const commands = [];
    for (let i = 0, len = appliedApplications.length; i < len; ++i) {
      const application = appliedApplications[i];

      if (isTestApplication(application)) {
        commands.push({
          command: 'update',
          ref: db.collection('applications').doc(`${application.id}`),
          data: { status: 'draft' },
        });
      } else {
        commands.push({
          command: 'set',
          ref: db.collection('applicationRecords').doc(`${application.id}`),
          data: newApplicationRecord(firebase, exercise, application),  // needs firebase in order to insert timestamp @TODO there's a better way to do this
        });
      }
    }

    // write to db
    const result = await applyUpdates(db, commands);

    if (result) {
      // update counts (for all applications)
      await refreshApplicationCounts({
        exerciseId: params.exerciseId,
        applications: applications,
      });
      return commands.length;
    }
    return false;
  }

  /**
  * initialiseMissingApplicationRecords
  * Creates applicationRecords for each application in an exercise that doesn't already have an applicationRecord
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  */
  async function initialiseMissingApplicationRecords(params) {
    // get exercise
    const exercise = await getExercise(params.exerciseId);

    // get all applications
    let applicationsRef = db.collection('applications')
      .where('exerciseId', '==', params.exerciseId);
    const applications = await getDocuments(applicationsRef);
    const appliedApplications = applications.filter(application => application.status === 'applied');

    // get existing applicationRecords
    const applicationRecordsRef = db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId)
      .select('stage', 'status', 'flags');
    const applicationRecords = await getDocuments(applicationRecordsRef);
    const applicationRecordIds = applicationRecords.map(item => item.id);

    // get applications without corresponding application record
    const missingApplications = appliedApplications.filter(item => applicationRecordIds.indexOf(item.id) < 0);

    // construct db commands
    const commands = [];
    for (let i = 0, len = missingApplications.length; i < len; ++i) {
      const application = missingApplications[i];

      if (isTestApplication(application)) {
        commands.push({
          command: 'update',
          ref: db.collection('applications').doc(`${application.id}`),
          data: { status: 'draft' },
        });
      } else {
        commands.push({
          command: 'set',
          ref: db.collection('applicationRecords').doc(`${application.id}`),
          data: newApplicationRecord(firebase, exercise, application),
        });
      }
    }
    // update counts
    await refreshApplicationCounts({
      exerciseId: params.exerciseId,
      applications: applications,
      applicationRecords: applicationRecords,
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? commands.length : false;
  }

};
