const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const initialiseQualifyingTest = require('../actions/qualifyingTests/initialiseQualifyingTest')(config, firebase, db);
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
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
    PERMISSIONS.qualifyingTestResponses.permissions.canCreateQualifyingTestResponses.value,
  ]);

  if (!checkArguments({
    qualifyingTestId: { required: true },
    stage: { required: false },
    status: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return initialiseQualifyingTest(data);
});