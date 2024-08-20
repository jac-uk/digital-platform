import functions from 'firebase-functions';
import { firebase, db, auth } from '../shared/admin.js';
import initExportApplicationContactsData from '../actions/exercises/exportApplicationContactsData.js';
import { getDocument, checkArguments } from '../shared/helpers.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { exportApplicationContactsData } = initExportApplicationContactsData(firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.runWith({
  timeoutSeconds: 180,
  memory: '512MB',
}).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.applications.permissions.canReadApplications.value,
  ]);

  // validate input parameters
  if (!checkArguments({
    exerciseId: { required: true },
    status: { required: true },
    processingStage: { required: false },
    processingStatus: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  // log an event
  const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));
  let details = {
    exerciseId: exercise.id,
    exerciseRef: exercise.referenceNumber,
    status: data.status,
  };
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Application contacts exported', details, user);

  // return the requested data
  return await exportApplicationContactsData({
    exerciseId: data.exerciseId,
    status: data.status,
    processingStage: data.processingStage,
    processingStatus: data.processingStatus,
  });

});
