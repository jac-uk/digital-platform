import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import initServiceSettings from '../shared/serviceSettings.js';
import initVerification from '../actions/candidates/verification.js';
import { checkArguments } from '../shared/helpers.js';

import { defineSecret } from 'firebase-functions/params';
const NOTIFY_KEY = defineSecret('NOTIFY_KEY');

const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    secrets: [NOTIFY_KEY],  // ✅ Ensure the function has access to the secrets
  },
  async (request) => {
    const data = request.data;
    try {
      await checkFunctionEnabled();
      if (!checkArguments({
        code: { required: true },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }

      const { verifySmsCode } = initVerification(NOTIFY_KEY, firebase, db);

      const uid = request.auth.uid;
      return await verifySmsCode({ uid, code: data.code });
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
