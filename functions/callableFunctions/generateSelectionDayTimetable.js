import * as functions from 'firebase-functions/v1';
import { db } from '../shared/admin.js';
import initGenerateSelectionDayTimetable from '../actions/tasks/generateSelectionDayTimetable.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const generateSelectionDayTimetable = initGenerateSelectionDayTimetable(db);
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

  const result = await generateSelectionDayTimetable(data.exerciseId);  
  return {
    result: result,
  };
});
