const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const  { adminUpdateUserRole } = require('../actions/userRoles')(db, auth);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
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

});

