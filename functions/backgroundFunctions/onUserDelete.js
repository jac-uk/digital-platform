import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { db, auth } from '../shared/admin.js';
import initUsers from '../actions/users.js';

const { deleteUsers } = initUsers(auth, db);

export default onDocumentDeleted('users/{userId}', (event) => {
  const snap = event.data;
  const user = snap.data();
  const userId = event.params.userId;
  // if user has only one provider, delete user from authentication database
  if (user.providerData && user.providerData.length === 1) {
    return deleteUsers([userId]);
  }
  return true;
});
