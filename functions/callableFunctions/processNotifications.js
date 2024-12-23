import functions from 'firebase-functions';
import config from '../shared/config.js';
import { db, firebase } from '../shared/admin.js';
import initNotifications from '../actions/notifications.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { processNotifications } = initNotifications(config, firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.notifications.permissions.canUpdateNotifications.value,
    PERMISSIONS.settings.permissions.canUpdateSettings.value,
  ]);

  return await processNotifications();
});
