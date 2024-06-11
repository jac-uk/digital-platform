const functions = require('firebase-functions');
const { db } = require('../shared/admin.js');
const { customReport } = require('../actions/exercises/customReport')(db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  return customReport(data, context);
});
