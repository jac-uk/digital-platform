import * as functions from 'firebase-functions/v1';
import { firebase, db } from '../shared/admin.js';
import selectionDayTimetable from '../actions/tasks/selectionDayTimetable.js';
import { getDocument } from '../shared/helpers.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

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

  // generate selection day timetable
  // TODO: parameters should be passed to the function
  const result = await selectionDayTimetable();  
  return {
    result: result,
  };
});
