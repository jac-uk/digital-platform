import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initRefreshApplicationCounts from '../actions/exercises/refreshApplicationCounts.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { refreshApplicationCounts } = initRefreshApplicationCounts(firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MiB',       // (Optional) Configure memory allocation
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
        PERMISSIONS.exercises.permissions.canReadExercises.value,
        PERMISSIONS.exercises.permissions.canUpdateExercises.value,
        PERMISSIONS.applications.permissions.canReadApplications.value,
        PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
      ]);
    
      if (!checkArguments({
        exerciseId: { required: true },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }
      const result = await refreshApplicationCounts(data);
      return result;
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
