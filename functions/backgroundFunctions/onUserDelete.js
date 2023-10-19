const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin');
const { deleteUsers } = require('../actions/users')(auth, db);

module.exports = functions.region('europe-west2').firestore
  .document('users/{userId}')
  .onDelete((snap, context) => {
    const user = snap.data();
    const userId = context.params.userId;
    return deleteUsers([userId]);
  });
