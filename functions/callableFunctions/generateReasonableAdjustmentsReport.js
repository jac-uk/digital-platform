import functions from 'firebase-functions';
import { firebase, db, auth } from '../shared/admin.js';
import initGenerateReasonableAdjustmentsReport from '../actions/exercises/generateReasonableAdjustmentsReport.js';
import getDocument from '@jac-uk/jac-kit/helpers/helpers.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { generateReasonableAdjustmentsReport } = initGenerateReasonableAdjustmentsReport(firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applications.permissions.canReadApplications.value,
    PERMISSIONS.exercises.permissions.canReadExercises.value,
  ]);

  // validate input parameters
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }

  // generate the report
  const result = await generateReasonableAdjustmentsReport(data.exerciseId);

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
  await logEvent('info', 'Reasonable adjustments report generated', details, user);

  // return the report to the caller
  return {
    result: result,
  };

});
