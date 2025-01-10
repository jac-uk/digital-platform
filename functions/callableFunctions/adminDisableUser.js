import * as functions from 'firebase-functions/v1';
import { db, auth } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initUserRoles from '../actions/userRoles.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const  { toggleDisableUser } = initUserRoles(db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [PERMISSIONS.users.permissions.canEnableUsers.value]);

  if (!checkArguments({
    uid: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  //TODO: add role check here
  return await toggleDisableUser(data);

});

