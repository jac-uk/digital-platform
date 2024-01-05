const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin');
const { deleteUsers } = require('../actions/users')(auth, db);

module.exports = functions.region('europe-west2').firestore
  .document('users/{userId}')
  .onDelete((snap, context) => {
    const user = snap.data();
    const userId = context.params.userId;
    // if user has only one provider, delete user from authentication database
    if (user.providerData && user.providerData.length === 1) {
      return deleteUsers([userId]);
    }
  });
