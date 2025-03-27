import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, auth } from '../shared/admin.js';
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
      await checkFunctionEnabled();

      // authenticate the request
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      return await checkSignInMethodsForEmail(request.auth.token.email);
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
