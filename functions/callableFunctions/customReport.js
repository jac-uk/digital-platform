const functions = require('firebase-functions');
const { auth } = require('../shared/admin.js');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { customReport } = require('../actions/exercises/customReport')(config, firebase, db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

const runtimeOptions = {
  memory: '256MB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  return customReport(data, context);
});
