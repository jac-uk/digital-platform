const functions = require('firebase-functions');
const config = require('../shared/config.js');
const { firebase, db } = require('../shared/admin.js');
const flagApplicationIssues = require('../actions/applications/flagApplicationIssues')(firebase, config, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

const runtimeOptions = {
  timeoutSeconds: 300,
  memory: '512MB',
};

module.exports = functions.region('europe-west2').runWith(runtimeOptions).https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  // @TODO check auth.token for correct role, when we have implemented roles
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.applicationRecords.permissions.canUpdateApplicationRecords.value,
  ]);

  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }
  const result = await flagApplicationIssues.flagApplicationIssuesForExercise(data.exerciseId, data.reset);
  return {
    result: result,
  };
});
