const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin.js');
const  { adminSyncUserRolePermissions } = require('../actions/userRoles')(db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  //TODO: add role check here
  return await adminSyncUserRolePermissions(context.auth.uid);

});


