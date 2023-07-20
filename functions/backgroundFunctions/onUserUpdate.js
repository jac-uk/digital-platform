const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin');
const { onUserUpdate } = require('../actions/users')(auth, db);

module.exports = functions.region('europe-west2').firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    const userId = context.params.userId;
    await onUserUpdate(userId, before, after);
    return true;
  });
