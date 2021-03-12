const functions = require('firebase-functions');
const { firebase, db } = require('../shared/admin.js');
const { exportQualifyingTestResponses } = require('../actions/qualifyingTestResponses/export')(firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!(typeof data.qualifyingTestId === 'string') || data.qualifyingTestId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "qualifyingTestId"');
  }

  // return the requested data
  return await exportQualifyingTestResponses(data.qualifyingTestId);

});
