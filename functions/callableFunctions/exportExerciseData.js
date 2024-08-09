import functions from 'firebase-functions';
import { checkArguments } from '../shared/helpers.js';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import initExportExerciseData from '../actions/exercises/exportExerciseData.js';
import { getAllDocuments } from '../shared/helpers.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { exportExerciseData } = initExportExerciseData(config, firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

const runtimeOptions = {
  timeoutSeconds: 300,
  memory: '1GB',
};

export default functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
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
  if (!checkArguments({
    exerciseIds: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  // generate the export
  const result = await exportExerciseData(data.exerciseIds);

  // log an event
  const exerciseRefs = data.exerciseIds.map(id => db.collection('exercises').doc(id));
  const exercises = await getAllDocuments(db, exerciseRefs);
  let details = {
    exercises: [],
  };
  exercises.forEach(exercise => {
    details.exercises.push({
      exerciseId: exercise.id,
      exerciseRef: exercise.referenceNumber,
    });
  });
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Exercises exported', details, user);

  // return the report to the caller
  return result;
});
