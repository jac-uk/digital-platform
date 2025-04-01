import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from '../shared/admin.js';
import initCheckDuplicateApplications from '../actions/exercises/checkDuplicateApplications.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const checkDuplicateApplications = initCheckDuplicateApplications(db);
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
      if (!request.auth?.uid) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.applications.permissions.canReadApplications.value,
      ]);

      return await checkDuplicateApplications(data);
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
