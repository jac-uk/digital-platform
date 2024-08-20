import functions from 'firebase-functions';
import { db, auth } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initUsers from '../actions/users.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { createUser } = initUsers(auth, db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [PERMISSIONS.users.permissions.canCreateUsers.value]);

  if (!checkArguments({
    email: { required: true },
    password: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  return await createUser(data);
});
