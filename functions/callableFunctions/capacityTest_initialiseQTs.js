const functions = require('firebase-functions');
const { firebase, db } = require('../shared/admin.js');
const { initialiseQTs } = require('../actions/capacityTesting/initialiseQTs')(firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an exercise id');
  }
  if (!(typeof data.qualifyingTestId === 'string') || data.qualifyingTestId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a qualifying test id');
  }
  if (!(typeof data.noOfCandidates === 'number')) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a number of candidate');
  }

  // initialise qualifying tests
  const result = await initialiseQTs(data.exerciseId, data.qualifyingTestId, data.noOfCandidates);
  return {
    result: result,
  };

});
