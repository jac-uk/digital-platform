import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../../../shared/admin.js';
import { checkArguments } from '../../../shared/helpers.js';
import initUpdateQualifyingTestScores from '../../../actions/qualifyingTests/v2/updateQualifyingTestScores.js';
import initServiceSettings from  '../../../shared/serviceSettings.js';

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
        exerciseId: { required: true },
        type: { required: true },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }
      await checkFunctionEnabled();
    
      const updateQualifyingTestScores = initUpdateQualifyingTestScores(process.env.QT_KEY, firebase, db);

      const response = await updateQualifyingTestScores(data);
    
      return response;
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
