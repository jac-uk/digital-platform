import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db, auth } from '../shared/admin.js';
import initApplications from '../actions/applications/applications.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { sendPublishedFeedbackReportNotifications } = initApplications(firebase, db, auth);
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
        PERMISSIONS.applications.permissions.canReadApplications.value,
        PERMISSIONS.exercises.permissions.canReadExercises.value,
      ]);

      // validate input parameters
      if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify an "exerciseId"');
      }
      if (!(typeof data.type === 'string') || data.type.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify a type');
      }

      // Get the candidates and send the email
      return await sendPublishedFeedbackReportNotifications(data.exerciseId, data.type);
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
