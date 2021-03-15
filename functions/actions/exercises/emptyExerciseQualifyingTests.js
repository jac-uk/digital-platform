const { getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return emptyExerciseQualifyingTests;

  /**
  * emptyExerciseQualifyingTests
  * Empties qualifying tests from exercise by:
  * - Deleting all related qualifyingTestResponses
  * - Deleting all qualifyingTests
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  */
  async function emptyExerciseQualifyingTests(params) {

    // get qualifying tests
    const qualifyingTests = await getDocuments(db.collection('qualifyingTests').where('vacancy.id', '==', params.exerciseId).select());

    // delete all qualifyingTestResponses
    const qualifyingTestResponses = await getDocuments(db.collection('qualifyingTestResponses').where('vacancy.id', '==', params.exerciseId).select());

    // construct db commands
    const commands = [];
    for (let i = 0, len = qualifyingTests.length; i < len; ++i) {
      const qualifyingTest = qualifyingTests[i];
      commands.push({
        command: 'delete',
        ref: qualifyingTest.ref,
      });
    }
    for (let i = 0, len = qualifyingTestResponses.length; i < len; ++i) {
      const qualifyingTestResponse = qualifyingTestResponses[i];
      commands.push({
        command: 'delete',
        ref: qualifyingTestResponse.ref,
      });
    }

    // write to db
    const result = await applyUpdates(db, commands);

    // return
    return result ? commands.length : false;

  }

};
