import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initFlagApplicationIssues from '../actions/applications/flagApplicationIssues.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const flagApplicationIssues = initFlagApplicationIssues(firebase, config, db);
const { checkFunctionEnabled } = initServiceSettings(db);

const runtimeOptions = {
  timeoutSeconds: 300,
  memory: '512MB',
};

export default functions.region('europe-west2').runWith(runtimeOptions).https.onCall(async (data, context) => {
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
