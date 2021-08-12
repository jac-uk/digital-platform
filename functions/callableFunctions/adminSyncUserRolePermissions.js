const functions = require('firebase-functions');
const { db } = require('../shared/admin.js');
const  { adminSyncUserRolePermissions } = require('../actions/userRoles')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  //TODO: add role check here
  return await adminSyncUserRolePermissions(context.auth.uid);

});


