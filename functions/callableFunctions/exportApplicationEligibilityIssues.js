const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin.js');
const { exportApplicationEligibilityIssues } = require('../actions/exercises/exportApplicationEligibilityIssues')(db);
const { getDocument } = require('../shared/helpers');
const { logEvent } = require('../actions/logs/logEvent')(db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
    PERMISSIONS.applications.permissions.canReadApplications.value,
  ]);

  // validate input parameters
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }
  if (!(typeof data.format === 'string') || data.format.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a data format (excel or googledoc)');
  }

  // log an event
  const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));

  if (!exercise) {
    throw new functions.https.HttpsError('not-found', 'Excercise not found');
  }

  let details = {
    exerciseId: exercise.id,
    exerciseRef: exercise.referenceNumber,
  };
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Application eligibility issues exported (to ' + data.format + ')', details, user);

  // return the requested data
  return await exportApplicationEligibilityIssues(data.exerciseId, data.format);

});
