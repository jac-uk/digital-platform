import functions from 'firebase-functions';
import { firebase, db, auth } from '../../shared/admin.js';
import initExportSccSummaryReport from '../../actions/exercises/sccSummaryReport.js';
import { getDocument } from '../../shared/helpers.js';
import initLogEvent from '../../actions/logs/logEvent.js';
import initServiceSettings from '../../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../../shared/permissions.js';

const { exportSccSummaryReport } = initExportSccSummaryReport(firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
    PERMISSIONS.applications.permissions.canReadApplications.value,
  ]);

  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }

  if (!(typeof data.format === 'string') || data.format.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a data format (excel or googledoc)');
  }

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
  await logEvent('info', 'SCC Summary report exported (to ' + data.format + ')', details, user);
  return await exportSccSummaryReport(data.exerciseId, data.format, (data.status || null));
});
