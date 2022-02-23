const functions = require('firebase-functions');
const { db } = require('../shared/admin.js');
const { initialiseQTs } = require('../actions/capacityTesting/initialiseQTs')(db);

const runtimeOptions = {
  timeoutSeconds: 540, // the maximum value for timeoutSeconds is 540 seconds
  memory: '1GB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {

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
  if (!(typeof data.refPrefix === 'string') || data.refPrefix.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a reference prefix');
  }
  if (!(typeof data.userId === 'string') || data.userId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a userId');
  }

  // initialise qualifying tests
  return await initialiseQTs(data);
});
