import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import verifyChecksumInit from '../actions/malware-scanning/verifyFileChecksum.js';

const verifyChecksum = verifyChecksumInit(firebase, db);

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
      const data = request.data;

      const { filePath } = data;

      try {
        const result = await verifyChecksum(filePath);

        // Ensure that the result is what the frontend expects
        return {
          valid: result.valid,
          message: result.message || null,
        };
      } catch (error) {
        console.error('Error verifying checksum:', error);

        // Throw an HttpsError with a message to return a proper error response
        throw new HttpsError('internal', error.message);
      }
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
