const functions = require('firebase-functions');
const config = require('../shared/config');
const { db, firebase } = require('../shared/admin');
const { processNotifications } = require('../actions/notifications')(config, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  return await processNotifications();
});
