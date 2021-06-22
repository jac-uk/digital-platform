const functions = require('firebase-functions');
const { checkArguments } = require('../shared/helpers.js');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { importScores }  = require('../actions/qualifyingTestResponses/importScores.js')(config, firebase, db);
const { logEvent } = require('../actions/logs/logEvent')(firebase, db);

const runtimeOptions = {
  timeoutSeconds: 300,
  memory: '1GB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!checkArguments({
    qualifyingTestId: { required: true },
    fullFilePath: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  const result = importScores(data.qualifyingTestId, data.fullFilePath);

  // return the report to the caller
  return result;
});
