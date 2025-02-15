import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import initScanAllFiles from '../actions/malware-scanning/scanAllFiles.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { scanAllFiles } = initScanAllFiles(firebase);
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
    
      if (data.async === false) {
        await scanAllFiles(data.force || false, data.maxFiles || 999999);
      } else {
        scanAllFiles(data.force || false, data.maxFiles || 999999);
      }
    
      // return the outcome
      return true;
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);

