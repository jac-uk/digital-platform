const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const sendQualifyingTestReminders = require('../actions/qualifyingTests/sendQualifyingTestReminders')(config, firebase, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');
const { wrapFunction } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').https.onCall(wrapFunction(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.qualifyingTests.permissions.canReadQualifyingTests.value,
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.qualifyingTestResponses.permissions.canReadQualifyingTestResponses.value,
    PERMISSIONS.notifications.permissions.canCreateNotifications.value,
  ]);

  if (!checkArguments({
    qualifyingTestId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await sendQualifyingTestReminders(data);
  return result;
}));
