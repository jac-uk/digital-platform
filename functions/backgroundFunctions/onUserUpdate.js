import * as functions from 'firebase-functions/v1';
import { db, auth } from '../shared/admin.js';
import initUsers from '../actions/users.js';

const { onUserUpdate } = initUsers(auth, db);

export default functions.region('europe-west2').firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    const userId = context.params.userId;
    await onUserUpdate(userId, before, after);
    return true;
  });
