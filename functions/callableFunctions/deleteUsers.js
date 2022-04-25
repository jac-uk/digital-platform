const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const PERMISSIONS = require('../shared/permissions');
const { deleteUsers } = require('../actions/users')(auth, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!context.auth.token.rp || !context.auth.token.rp.includes(PERMISSIONS.canDeleteUsers)) {
    throw new functions.https.HttpsError('failed-precondition', 'Permission denied');
  }
  if (!checkArguments({ uids: { required: true } }, data) || !Array.isArray(data.uids) || data.uids.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  return await deleteUsers(data.uids);
});
