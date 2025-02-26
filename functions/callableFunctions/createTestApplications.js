import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db, auth } from '../shared/admin.js';
import initApplications from '../actions/applications/applications.js';
import { isProduction } from '../shared/helpers.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { loadTestApplications, createTestApplications } = initApplications(firebase, db, auth);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '1GiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 120,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
  },
  async (request) => {

    try {
      const data = request.data;

      // do not use this function on production
      if (isProduction()) {
        throw new HttpsError('failed-precondition', 'The function must not be called on production.');
      }

      // authenticate the request
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.applications.permissions.canCreateTestApplications.value,
      ]);

      if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify an exercise id');
      }
      if (!(typeof data.noOfTestApplications === 'number')) {
        throw new HttpsError('invalid-argument', 'Please specify a number of test applications');
      }

      const testApplications = await loadTestApplications();
      if (!testApplications) {
        throw new HttpsError('failed-precondition', 'Failed to load test applications from cloud storage.');
      }

      const maxNoOfTestApplications = testApplications.length;
      if (data.noOfTestApplications < 1 || data.noOfTestApplications > maxNoOfTestApplications) {
        throw new HttpsError('invalid-argument', 'The number of test applications should be between 1 and ' + maxNoOfTestApplications);
      }

      return await createTestApplications({
        ...data,
        testApplications,
      });
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
