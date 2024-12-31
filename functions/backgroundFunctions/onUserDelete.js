import functions from 'firebase-functions';
import { db, auth } from '../shared/admin.js';
import initUsers from '../actions/users.js';

const { deleteUsers } = initUsers(auth, db);

export default functions.region('europe-west2').firestore
  .document('users/{userId}')
  .onDelete((snap, context) => {
    const user = snap.data();
    const userId = context.params.userId;
    // if user has only one provider, delete user from authentication database
    if (user.providerData && user.providerData.length === 1) {
      return deleteUsers([userId]);
    }
    return true;
  });
