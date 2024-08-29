import functions from 'firebase-functions';
import { db, auth } from '../shared/admin.js';
import { checkArguments } from '@jac-uk/jac-kit/helpers/helpers.js';
import initUserRoles from '../actions/userRoles.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { adminUpdateUserRole } = initUserRoles(db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [PERMISSIONS.users.permissions.canEditRolePermissions.value]);

  if (!checkArguments({
    roleId: { required: true },
    enabledPermissions: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  // validate input parameters
  if (!Array.isArray(data.enabledPermissions)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  //TODO: add role check here
  return await adminUpdateUserRole(data);

});

