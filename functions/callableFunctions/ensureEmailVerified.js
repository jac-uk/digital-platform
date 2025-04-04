import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { auth } from '../shared/admin.js';

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    enforceAppCheck: true,
  },
  async (request) => {

    try {
      //const data = request.data;
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }
      try {
        const uid = request.auth.uid;
        const user = await auth.getUser(uid);
        if (user.emailVerified === false) {
          await auth.updateUser(uid, {
            emailVerified: true,
          });
        }
      } catch (e) {
        throw new HttpsError('unknown', e);
      }
      return {};
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
