import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../../shared/admin.js';
import { checkArguments } from '../../shared/helpers.js';
import initCreateTask from '../../actions/tasks/createTask.js';
import initServiceSettings from '../../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../../shared/permissions.js';

const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 180,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    secrets: [
      'QT_KEY',
      'QT_URL',
    ],  // ✅ Ensure the function has access to the secrets
    enforceAppCheck: true,
  },
  async (request) => {
    const createTask = initCreateTask(firebase, db);

    try {
      const data = request.data;

      await checkFunctionEnabled();

      // authenticate the request
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.tasks.permissions.canCreate.value,
      ]);

      if (!checkArguments({
        exerciseId: { required: true },
        type: { required: true },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }
      const result = await createTask(data);
      return result;
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
