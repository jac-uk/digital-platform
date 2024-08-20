import functions from 'firebase-functions';
import { db, auth } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';
import initUserRoles from '../actions/userRoles.js';
import initServiceSettings from '../shared/serviceSettings.js';

const  { adminSetUserRole } = initUserRoles(db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [PERMISSIONS.users.permissions.canChangeUserRole.value]);

  if (!checkArguments({
    userId: { required: true },
    roleId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  return await adminSetUserRole(data);
});
