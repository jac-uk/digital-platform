import functions from 'firebase-functions';
import { firebase, db, auth } from '../shared/admin.js';
import config from '../shared/config.js';
import initApplications from '../actions/applications/applications.js';
import { isProduction } from '../shared/helpers.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { loadTestApplications, createTestApplications } = initApplications(config, firebase, db, auth);

const runtimeOptions = {
  timeoutSeconds: 120,
  memory: '1GB',
};

export default functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  // do not use this function on production
  if (isProduction()) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must not be called on production.');
  }

  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canCreateTestApplications.value,
  ]);

  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an exercise id');
  }
  if (!(typeof data.noOfTestApplications === 'number')) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a number of test applications');
  }

  const testApplications = await loadTestApplications();
  if (!testApplications) {
    throw new functions.https.HttpsError('failed-precondition', 'Failed to load test applications from cloud storage.');
  }

  const maxNoOfTestApplications = testApplications.length;
  if (data.noOfTestApplications < 1 || data.noOfTestApplications > maxNoOfTestApplications) {
    throw new functions.https.HttpsError('invalid-argument', 'The number of test applications should be between 1 and ' + maxNoOfTestApplications);
  }

  return await createTestApplications({
    ...data,
    testApplications,
  });
});
