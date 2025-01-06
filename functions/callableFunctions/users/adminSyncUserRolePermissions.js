import functions from 'firebase-functions';
import { db, auth } from '../../shared/admin.js';
import initUserRoles from '../../actions/userRoles.js';
import initServiceSettings from '../../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../../shared/permissions.js';

const { adminSyncUserRolePermissions } = initUserRoles(db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [PERMISSIONS.users.permissions.canEditRolePermissions.value]);

  //TODO: add role check here
  return await adminSyncUserRolePermissions(context.auth.uid);

});


