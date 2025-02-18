import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import initGenerateDiversityData from '../actions/exercises/generateDiversityData.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { generateDiversityData } = initGenerateDiversityData(firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
  },
  async (request) => {

    try {
      const data = request.data;

      await checkFunctionEnabled();

      // authenticate the request
      if (!request.auth?.uid) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.exercises.permissions.canReadExercises.value,
        PERMISSIONS.applications.permissions.canReadApplications.value,
        PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
      ]);

      // validate input parameters
      if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify an "exerciseId"');
      }

      // generate the report
      const result = await generateDiversityData(data.exerciseId);

      // return the report to the caller
      return {
        result: result,
      };
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
