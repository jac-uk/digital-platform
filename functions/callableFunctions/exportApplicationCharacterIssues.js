const functions = require('firebase-functions');
const {getDocument} = require('../shared/helpers');
const { firebase, db } = require('../shared/admin.js');
const { exportApplicationCharacterIssues } = require('../actions/exercises/exportApplicationCharacterIssues')(firebase, db);
const { logEvent } = require('../actions/logs/logEvent')(firebase, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.logs.permissions.canCreateLogs.value,
  ]);

  // validate input parameters
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }

  // fetch the requested data
  const result = await exportApplicationCharacterIssues(data.exerciseId, data.stage || 'all', data.status || 'all');

  // log character generation report generation request
  const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));
  let details = {
    exerciseId: exercise.id,
    exerciseRef: exercise.referenceNumber,
  };
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Application character issues exported', details, user);

  return result;
});
