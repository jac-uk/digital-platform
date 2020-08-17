const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const newQualifyingTestResponse = require('../../shared/factories/newQualifyingTestResponse')(firebase, config);

  return initialiseQualifyingTest;

  /**
  * initialiseQualifyingTest
  * Creates qualifyingTestResponse document for each candidate invited to the qualifying test
  * @param {*} `params` is an object containing
  *   `qualifyingTestId` (required) ID of qualifying test
  *   `stage` (required) exercise stage
  */
  async function initialiseQualifyingTest(params) {

    // get qualifying test
    const qualifyingTest = await getDocument(db.doc(`qualifyingTests/${params.qualifyingTestId}`));

    // get application records
    let applicationRecordsRef = db.collection('applicationRecords')
      .where('exercise.id', '==', qualifyingTest.exercise.id)
      .where('stage', '==', params.stage);
    const applicationRecords = await getDocuments(applicationRecordsRef);

    // construct db commands
    const commands = [];
    for (let i = 0, len = applicationRecords.length; i < len; ++i) {
      const applicationRecord = applicationRecords[i];
      commands.push({
        command: 'set',
        ref: db.collection('qualifyingTestResponses').doc(`${applicationRecord.application.id}`),
        data: newQualifyingTestResponse(qualifyingTest, applicationRecord),
      });
    }

    // update qualifying test status and counts
    commands.push({
      command: 'update',
      ref: qualifyingTest.ref,
      data: {
        status: 'initialised',
        counts: {
          initialised: applicationRecords.length,
          started: 0,
          inProgress: 0,
          completed: 0,
        },
      },
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applicationRecords.length : false;

  }

}
