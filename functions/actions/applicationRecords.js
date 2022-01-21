const { getDocument, getDocuments, applyUpdates } = require('../shared/helpers');

module.exports = (config, firebase, db) => {
  const { newApplicationRecord } = require('../shared/factories')(config);
  const newQualifyingTestResponse = require('../shared/factories/QualifyingTests/newQualifyingTestResponse')(config, firebase);
  const { logEvent } = require('./logs/logEvent')(firebase, db);
  const { refreshApplicationCounts } = require('../actions/exercises/refreshApplicationCounts')(firebase, db);

  return {
    initialiseApplicationRecords,  // @TODO this will be removed once we have database triggers turned on *and* existing exercises have been initialised
    initialiseMissingApplicationRecords,  // @TODO this will be removed once we have database triggers turned on *and* existing exercises have been initialised
    onApplicationRecordUpdate,
  };

  function getExercise(exerciseId) {
    return getDocument(db.collection('exercises').doc(exerciseId));
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
      commands.push({
        command: 'set',
        ref: db.collection('applicationRecords').doc(`${application.id}`),
        data: newApplicationRecord(exercise, application),
      });
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
      commands.push({
        command: 'set',
        ref: db.collection('applicationRecords').doc(`${application.id}`),
        data: newApplicationRecord(exercise, application),
      });
    }
    // update counts
    await refreshApplicationCounts({
      exerciseId: params.exerciseId,
      applications: applications,
      applicationRecords: applicationRecords,
    });

    // check for initialised/activated qts
    const qualifyingTests = await getDocuments(
      db.collection('qualifyingTests')
      .where('vacancy.id', '==', params.exerciseId)
      .where('status', 'in', [
        config.QUALIFYING_TEST.STATUS.INITIALISED,
        config.QUALIFYING_TEST.STATUS.ACTIVATED,
        config.QUALIFYING_TEST.STATUS.PAUSED,
        config.QUALIFYING_TEST.STATUS.COMPLETED,
      ])
    );
    if (qualifyingTests.length) {
      qualifyingTests.forEach(qualifyingTest => {
        if (!qualifyingTest.mode) {
          if (
            qualifyingTest.type === config.QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS ||
            qualifyingTest.type === config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT
          ) {
            // add qualifyingTestResponse for each application
            for (let i = 0, len = missingApplications.length; i < len; ++i) {
              const application = missingApplications[i];
              commands.push({
                command: 'set',
                ref: db.collection('qualifyingTestResponses').doc(),
                data: newQualifyingTestResponse(qualifyingTest, newApplicationRecord(exercise, application)),
              });
            }
          }
        }
      });
    }

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? commands.length : false;
  }

};
