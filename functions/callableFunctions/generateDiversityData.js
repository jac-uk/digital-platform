import * as functions from 'firebase-functions/v1';
import { firebase, db } from '../shared/admin.js';
import initGenerateDiversityData from '../actions/exercises/generateDiversityData.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { generateDiversityData } = initGenerateDiversityData(firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
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
  const result = await generateDiversityData(data.exerciseId);

  // return the report to the caller
  return {
    result: result,
  };
});
