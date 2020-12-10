const { getDocument, getDocuments, applyUpdates } = require('../shared/helpers');

module.exports = (config, firebase, db) => {
  const { newApplicationRecord } = require('../shared/factories')(config);
  const newQualifyingTestResponse = require('../shared/factories/QualifyingTests/newQualifyingTestResponse')(config, firebase);

  return {
    initialiseApplicationRecords,  // @TODO this will be removed once we have database triggers turned on *and* existing exercises have been initialised
    initialiseMissingApplicationRecords,  // @TODO this will be removed once we have database triggers turned on *and* existing exercises have been initialised
    onApplicationRecordUpdate,
  };

  function getExercise(exerciseId) {
    return getDocument(db.collection('exercises').doc(exerciseId));
  }

  async function onApplicationRecordUpdate(dataBefore, dataAfter) {
    if (dataBefore.stage !== dataAfter.stage) {
      const exerciseId = dataBefore.exercise.id;
      const data = {};
      const increment = firebase.firestore.FieldValue.increment(1);
      const decrement = firebase.firestore.FieldValue.increment(-1);
      data[`applicationRecords.${dataBefore.stage}`] = decrement;
      data[`applicationRecords.${dataAfter.stage}`] = increment;
      await db.doc(`exercises/${exerciseId}`).update(data);
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
    if (exercise.applicationRecords && exercise.applicationRecords.initialised) {
      return false;
    }

    // get applications
    let applicationsRef = db.collection('applications')
      .where('exerciseId', '==', params.exerciseId)
      .where('status', '==', 'applied');
    const applications = await getDocuments(applicationsRef);

    // construct db commands
    const commands = [];
    for (let i = 0, len = applications.length; i < len; ++i) {
      const application = applications[i];
      commands.push({
        command: 'set',
        ref: db.collection('applicationRecords').doc(`${application.id}`),
        data: newApplicationRecord(exercise, application),
      });
    }
    commands.push({
      command: 'update',
      ref: exercise.ref,
      data: {
        'applicationRecords.initialised': applications.length,
        'applicationRecords.review': applications.length,
        'applicationRecords.shortlisted': 0,
        'applicationRecords.selected': 0,
        'applicationRecords.recommended': 0,
        'applicationRecords.handover': 0,
      },
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applications.length : false;
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
      .where('exerciseId', '==', params.exerciseId)
      .where('status', '==', 'applied');
    const applications = await getDocuments(applicationsRef);

    // get existing applicationRecords
    const applicationRecordsRef = db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId)
      .select();
    const applicationRecords = await getDocuments(applicationRecordsRef);
    const applicationRecordIds = applicationRecords.map(item => item.id);

    // get applications without corresponding application record
    const missingApplications = applications.filter(item => applicationRecordIds.indexOf(item.id) < 0);

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
    if (missingApplications.length) {
      const increment = firebase.firestore.FieldValue.increment(missingApplications.length);
      commands.push({
        command: 'update',
        ref: exercise.ref,
        data: {
          'applicationRecords.initialised': increment,
          'applicationRecords.review': increment,
        },
      });
    }

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
