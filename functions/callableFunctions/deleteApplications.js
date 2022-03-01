const functions = require('firebase-functions');
const { firebase, db, auth } = require('../shared/admin.js');
const config = require('../shared/config');
const { deleteApplications } = require('../actions/applications/applications')(config, firebase, db, auth);

const runtimeOptions = {
  timeoutSeconds: 120,
  memory: '1GB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an exercise id');
  }

  return await deleteApplications(data.exerciseId);
});
