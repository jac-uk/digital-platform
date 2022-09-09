const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const  { adminUpdateUserRole } = require('../actions/userRoles')(db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');
const config = require('../shared/config');
const { wrapFunction } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').https.onCall(wrapFunction(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [PERMISSIONS.users.permissions.canEditRolePermissions.value]);

  if (!checkArguments({
    roleId: { required: true },
    enabledPermissions: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  // validate input parameters
  if (!Array.isArray(data.enabledPermissions)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  //TODO: add role check here
  return await adminUpdateUserRole(data);

}));
