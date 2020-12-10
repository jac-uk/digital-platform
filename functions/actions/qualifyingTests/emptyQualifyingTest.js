const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return emptyQualifyingTest;

  /**
  * emptyQualifyingTest
  * Empties qualifying test by:
  * - Deleting all qualifyingTestResponses documents that are part of this test
  * - Removing `counts` from qualifyingTest document
  * - Setting `status` of qualifyingTest to 'created'
  * @param {*} `params` is an object containing
  *   `qualifyingTestId` (required) ID of qualifying test
  */
  async function emptyQualifyingTest(params) {

    // get qualifying test
    const qualifyingTest = await getDocument(db.doc(`qualifyingTests/${params.qualifyingTestId}`));
    if (!qualifyingTest) {
      return false;
    }

    // delete all qualifyingTestResponses
    let qualifyingTestResponsesRef = db.collection('qualifyingTestResponses')
      .where('qualifyingTest.id', '==', qualifyingTest.id)
      .select('application.id');
    const qualifyingTestResponses = await getDocuments(qualifyingTestResponsesRef);

    // construct db commands
    const commands = [];
    for (let i = 0, len = qualifyingTestResponses.length; i < len; ++i) {
      const qualifyingTestResponse = qualifyingTestResponses[i];
      commands.push({
        command: 'delete',
        ref: qualifyingTestResponse.ref,
      });
    }

    // update qualifying test status and counts
    commands.push({
      command: 'update',
      ref: qualifyingTest.ref,
      data: {
        status: 'created',
        'counts': null,
      },
    });

    // write to db
    const result = await applyUpdates(db, commands);

    // return
    return result ? qualifyingTestResponses.length : false;

  }

};
