const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const PERMISSIONS = require('../shared/permissions');
const  { adminSetUserRole } = require('../actions/userRoles')(db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!context.auth.token.rp || !context.auth.token.rp.includes(PERMISSIONS.canChangeUserRole)) {
    throw new functions.https.HttpsError('failed-precondition', 'Permission denied');
  }
  if (!checkArguments({
    userId: { required: true },
    roleId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  return await adminSetUserRole(data);
});

