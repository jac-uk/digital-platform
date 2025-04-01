import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db, auth } from '../shared/admin.js';
import initApplications from '../actions/applications/applications.js';
import { isProduction } from '../shared/helpers.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { deleteApplications } = initApplications(firebase, db, auth);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '1GiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 120,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    enforceAppCheck: true,
  },
  async (request) => {

    try {
      const data = request.data;

      // authenticate the request
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
        PERMISSIONS.applicationRecords.permissions.canDeleteApplicationRecords.value,
        PERMISSIONS.exercises.permissions.canReadExercises.value,
        PERMISSIONS.exercises.permissions.canUpdateExercises.value,
        PERMISSIONS.applications.permissions.canReadApplications.value,
        PERMISSIONS.applications.permissions.canDeleteApplications.value,
      ]);

      if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify an exercise id');
      }

      // do not use this function on production
      if (isProduction()) {
        throw new HttpsError('failed-precondition', 'The function must not be called on production.');
      }

      return await deleteApplications(data.exerciseId);
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
