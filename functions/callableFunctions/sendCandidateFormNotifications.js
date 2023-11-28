const functions = require('firebase-functions');
const config = require('../shared/config.js');
const { firebase, db, auth } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const { sendCandidateFormNotifications } = require('../actions/applications/applications.js')(config, firebase, db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions.js');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.applications.permissions.canUpdateApplications.value,
    PERMISSIONS.notifications.permissions.canCreateNotifications.value,
  ]);

  if (!checkArguments({
    type: { required: true },
    notificationType: { required: true },
    items: { required: true },
    exerciseMailbox: { required: true },
    exerciseManagerName: { required: true },
    dueDate: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await sendCandidateFormNotifications(data);
});
