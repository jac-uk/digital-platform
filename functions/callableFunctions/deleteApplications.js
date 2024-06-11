const functions = require('firebase-functions');
const { db, auth, storage } = require('../shared/admin.js');
const config = require('../shared/config');
const { deleteApplications } = require('../actions/applications/applications')(config, db, auth, storage);
const { isProduction } = require('../shared/helpers');
const { PERMISSIONS, hasPermissions } = require('../shared/permissions');

const runtimeOptions = {
  timeoutSeconds: 120,
  memory: '1GB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
    PERMISSIONS.applicationRecords.permissions.canDeleteApplicationRecords.value,
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.exercises.permissions.canUpdateExercises.value,
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.applications.permissions.canDeleteApplications.value,
  ]);

  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an exercise id');
  }

  // do not use this function on production
  if (isProduction()) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must not be called on production.');
  }

  return await deleteApplications(data.exerciseId);
});
