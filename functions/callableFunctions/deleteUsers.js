import * as functions from 'firebase-functions/v1';
import { db, auth } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';
import initUsers from '../actions/users.js';

const { deleteUsers } = initUsers(auth, db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [PERMISSIONS.users.permissions.canDeleteUsers.value]);
  
  if (!checkArguments({ uids: { required: true } }, data) || !Array.isArray(data.uids) || data.uids.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  return await deleteUsers(data.uids);
});
