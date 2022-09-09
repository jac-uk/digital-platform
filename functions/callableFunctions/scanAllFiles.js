const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { scanAllFiles } = require('../actions/malware-scanning/scanAllFiles')(config, firebase);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { wrapFunction } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').https.onCall(wrapFunction(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  if (data.async === false) {
    await scanAllFiles(data.force || false, data.maxFiles || 999999);
  } else {
    scanAllFiles(data.force || false, data.maxFiles || 999999);
  }

  // return the outcome
  return true;

}));
