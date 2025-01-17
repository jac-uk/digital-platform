import * as functions from 'firebase-functions/v1';
import { firebase, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initRefreshApplicationCounts from '../actions/exercises/refreshApplicationCounts.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { refreshApplicationCounts } = initRefreshApplicationCounts(firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.exercises.permissions.canUpdateExercises.value,
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
  ]);

  if (!checkArguments({
    exerciseId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await refreshApplicationCounts(data);
  return result;
});
