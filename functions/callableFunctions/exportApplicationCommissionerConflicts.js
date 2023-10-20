const functions = require('firebase-functions');
const { firebase, db } = require('../shared/admin.js');
const { exportApplicationCommissionerConflicts } = require('../actions/exercises/exportApplicationCommissionerConflicts')(firebase, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.exercises.permissions.canReadExercises.value,
  ]);

  // validate input parameters
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }
  if (!(typeof data.format === 'string') || data.format.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a data format (excel or googledoc)');
  }

  // fetch the requested data
  const result = await exportApplicationCommissionerConflicts(data.exerciseId, data.stage || 'all', data.status || 'all', data.format);
  return result;
});
