import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initApplicationRecords from '../actions/applicationRecords.js';
import initGenerateDiversityReport from '../actions/exercises/generateDiversityReport.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { initialiseApplicationRecords } = initApplicationRecords(config, firebase, db, auth);
const { generateDiversityReport } = initGenerateDiversityReport(config, firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.runWith({
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
