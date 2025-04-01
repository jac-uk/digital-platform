import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { auth, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initCheckEnabledUserByEmail from '../actions/candidates/checkEnabledUserByEmail.js';
import initServiceSettings from '../shared/serviceSettings.js';

const checkEnabledUserByEmail = initCheckEnabledUserByEmail(auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '512MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    enforceAppCheck: true,
  },
  async (request) => {

    try {
      const data = request.data;

      await checkFunctionEnabled();

      if (!checkArguments({
        email: { required: true },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }

      return await checkEnabledUserByEmail(data);
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
