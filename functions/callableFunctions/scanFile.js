const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase } = require('../shared/admin.js');
const { scanFile } = require('../actions/malware-scanning/scanFile')(config, firebase);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!(typeof data.fileURL === 'string') || data.fileURL.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a fileURL');
  }

  // run the virus scan
  const result = await scanFile(data.fileURL);

  // return the outcome
  return result;

});
