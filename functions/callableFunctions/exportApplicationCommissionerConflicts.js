import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import initExportApplicationCommissionerConflicts from '../actions/exercises/exportApplicationCommissionerConflicts.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { exportApplicationCommissionerConflicts } = initExportApplicationCommissionerConflicts(firebase, db);
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
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.applications.permissions.canReadApplications.value,
        PERMISSIONS.exercises.permissions.canReadExercises.value,
      ]);

      // validate input parameters
      if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify an "exerciseId"');
      }
      if (!(typeof data.format === 'string') || data.format.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify a data format (excel or googledoc)');
      }

      // fetch the requested data
      const result = await exportApplicationCommissionerConflicts(data.exerciseId, data.stage || 'all', data.status || 'all', data.format);
      return result;
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
