const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { scanAllFiles } = require('../actions/malware-scanning/scanAllFiles')(config, firebase);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // start the virus scanning (but don't wait for it to finish)
  scanAllFiles(data.force || false, data.maxFiles || 999999);

  // return the outcome
  return true;

});
