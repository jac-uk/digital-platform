import functions from 'firebase-functions';
import config from '../../shared/config.js';
import { firebase, db, auth } from '../../shared/admin.js';
import initGenerateDiversityReport from '../../actions/exercises/generateDiversityReport.js';
import initGenerateDiversityData from '../../actions/exercises/generateDiversityData.js';
import { getDocument } from '../../shared/helpers.js';
import initLogEvent from '../../actions/logs/logEvent.js';
import initServiceSettings from '../../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../../shared/permissions.js';

const { generateDiversityReport } = initGenerateDiversityReport(config, firebase, db);
const { generateDiversityData } = initGenerateDiversityData(firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

const runtimeOptions = {
  timeoutSeconds: 120,
  memory: '512MB',
};

export default functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.exercises.permissions.canReadExercises.value,
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
  ]);

  // validate input parameters
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }

  // generate the report
  const result = await generateDiversityReport(data.exerciseId);

  // generate diversity data
  // TODO this is here temporarily. Sort it out!
  await generateDiversityData(data.exerciseId);

  // log an event
  const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));
  let details = {
    exerciseId: exercise.id,
    exerciseRef: exercise.referenceNumber,
  };
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Diversity report generated', details, user);

  // return the report to the caller
  return {
    result: result,
  };
});
