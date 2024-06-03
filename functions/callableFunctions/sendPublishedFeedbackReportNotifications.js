const functions = require('firebase-functions');
const config = require('../shared/config');
const { db, auth, storage } = require('../shared/admin.js');
const { sendPublishedFeedbackReportNotifications } = require('../actions/applications/applications.js')(config, db, auth, storage);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions.js');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.exercises.permissions.canReadExercises.value,
  ]);

  // validate input parameters
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }
  if (!(typeof data.type === 'string') || data.type.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a type');
  }

  // Get the candidates and send the email
  return await sendPublishedFeedbackReportNotifications(data.exerciseId, data.type);

});
