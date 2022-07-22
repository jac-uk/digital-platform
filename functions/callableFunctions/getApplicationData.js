const functions = require('firebase-functions');
const { auth } = require('../shared/admin.js');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const { getApplicationData } = require('../actions/exercises/getApplicationData')(config, firebase, db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canReadApplications.value,
  ]);

  // if (!checkArguments({
  //   exerciseId: { required: true },
  // }, data)) {
  //   throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  // }
  return getApplicationData(data);
});
