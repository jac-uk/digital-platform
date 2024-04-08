const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db, auth } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const { initialiseApplicationRecords } = require('../actions/applicationRecords')(config, firebase, db, auth);
const { generateDiversityReport } = require('../actions/exercises/generateDiversityReport')(config, firebase, db);
// const { flagApplicationIssuesForExercise } = require('../actions/applications/flagApplicationIssues')(config, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

module.exports = functions.runWith({
  timeoutSeconds: 180,
  memory: '1GB',
}).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.exercises.permissions.canUpdateExercises.value,
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
    PERMISSIONS.applicationRecords.permissions.canCreateApplicationRecords.value,
  ]);

  if (!checkArguments({
    exerciseId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await initialiseApplicationRecords(data);

  // once we have application records we can generate reports
  await generateDiversityReport(data.exerciseId);  // @TODO use pub/sub instead?
  // await flagApplicationIssuesForExercise(data.exerciseId);

  return {
    result: result,
  };
});
