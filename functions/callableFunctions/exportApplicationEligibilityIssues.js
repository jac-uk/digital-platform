import * as functions from 'firebase-functions/v1';
import { firebase, db, auth } from '../shared/admin.js';
import initExportApplicationEligibilityIssues from '../actions/exercises/exportApplicationEligibilityIssues.js';
import { getDocument } from '../shared/helpers.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { exportApplicationEligibilityIssues } = initExportApplicationEligibilityIssues(firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
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
  return await exportApplicationEligibilityIssues(data.exerciseId, data.format, (data.status || null));
});
