import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { db, auth } from '../shared/admin.js';
import initUsers from '../actions/users.js';

const { onUserUpdate } = initUsers(auth, db);

export default onDocumentUpdated('users/{userId}', async (event) => {
  const after = event.data.after.data();
  const before = event.data.before.data();
  const userId = event.params.userId;
  await onUserUpdate(userId, before, after);
  return true;
});
