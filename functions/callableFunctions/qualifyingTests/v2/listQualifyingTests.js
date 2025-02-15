import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from '../../../shared/admin.js';
import { checkArguments } from '../../../shared/helpers.js';
import initQts from '../../../shared/qts.js';
import initServiceSettings from '../../../shared/serviceSettings.js';

import { defineSecret } from 'firebase-functions/params';
const QT_KEY = defineSecret('QT_KEY');

const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    secrets: [QT_KEY],  // Specify the secret(s) you want to access
  },
  async (request) => {

    try {
      const data = request.data;
      if (!checkArguments({
        folder: { required: true },
        test: { required: true },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }
      await checkFunctionEnabled();
    
      const qts = initQts(process.env.QT_KEY);

      const response = await qts.get('qualifying-tests', {
        folder: data.folder,
      });
    
      return response;

    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
