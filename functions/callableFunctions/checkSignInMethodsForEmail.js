import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, auth } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initCheckSignInMethodsForEmail from '../actions/candidates/checkSignInMethodsForEmail.js';
import initServiceSettings from '../shared/serviceSettings.js';

const checkSignInMethodsForEmail = initCheckSignInMethodsForEmail(auth);

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

      // validate input parameters
      if (!checkArguments({
        email: { required: true },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }

      const result = await checkSignInMethodsForEmail({ email: data.email });
      return result;
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
