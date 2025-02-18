import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initAssessments from '../actions/assessments.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { cancelAssessments } = initAssessments(firebase, db);
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
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.assessments.permissions.canReadAssessments.value,
        PERMISSIONS.assessments.permissions.canUpdateAssessments.value,
        PERMISSIONS.exercises.permissions.canUpdateExercises.value,
      ]);

      if (!checkArguments({
        exerciseId: { required: true },
        assessmentIds: { required: false },
        cancelReason: { required: false },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }
      const result = await cancelAssessments(data);
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
