const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const activateQualifyingTest = require('../actions/qualifyingTests/activateQualifyingTest')(config, firebase, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.qualifyingTests.permissions.canReadQualifyingTests.value,
    PERMISSIONS.qualifyingTests.permissions.canUpdateQualifyingTests.value,
    PERMISSIONS.qualifyingTestResponses.permissions.canReadQualifyingTestResponses.value,
    PERMISSIONS.qualifyingTestResponses.permissions.canUpdateQualifyingTestResponses.value,
  ]);

  if (!checkArguments({
    qualifyingTestId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return activateQualifyingTest(data);

});
