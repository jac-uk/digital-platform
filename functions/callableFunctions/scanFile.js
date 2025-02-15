import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import initScanFile from '../actions/malware-scanning/scanFile.js';
import initServiceSettings from '../shared/serviceSettings.js';

const scanFile = initScanFile(firebase);

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
      if (!(typeof data.fileURL === 'string') || data.fileURL.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify a fileURL');
      }
    
      // run the virus scan
      const result = await scanFile(data.fileURL);
    
      // return the outcome
      return result;
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
