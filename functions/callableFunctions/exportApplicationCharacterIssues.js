import functions from 'firebase-functions';
import { getDocument } from '../shared/helpers.js';
import { firebase, db, auth } from '../shared/admin.js';
import initExportApplicationCharacterIssues from '../actions/exercises/exportApplicationCharacterIssues.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { exportApplicationCharacterIssues } = initExportApplicationCharacterIssues(firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.runWith({
  timeoutSeconds: 180,
  memory: '512MB',
}).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
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
  const result = await exportApplicationCharacterIssues(data.exerciseId, data.stage || 'all', data.status || 'all', data.format);

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
  await logEvent('info', 'Application character issues exported (to ' + data.format + ')', details, user);

  return result;
});
