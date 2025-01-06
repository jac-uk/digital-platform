import functions from 'firebase-functions';
import config from '../../shared/config.js';
import { firebase, db, auth } from '../../shared/admin.js';
import { checkArguments } from '../../shared/helpers.js';
import initApplications from '../../actions/applications/applications.js';
import initServiceSettings from '../../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../../shared/permissions.js';

const { sendCharacterCheckRequests } = initApplications(config, firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
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
    items: { required: true },
    type: { required: true },
    exerciseMailbox: { required: true },
    exerciseManagerName: { required: true },
    dueDate: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await sendCharacterCheckRequests(data);
});
