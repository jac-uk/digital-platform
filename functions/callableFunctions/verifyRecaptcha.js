import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initVerifyRecaptcha from '../actions/verifyRecaptcha.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    secrets: [ 'GOOGLE_RECAPTCHA_SECRET' ],  // ✅ Ensure the function has access to the secrets
  },
  async (request) => {

    try {
      const data = request.data;

      await checkFunctionEnabled();

      await checkFunctionEnabled();
      if (!checkArguments({
        token: { required: true },
        remoteip: { required: false },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }
      const verifyRecaptcha = initVerifyRecaptcha(
        process.env.GOOGLE_RECAPTCHA_SECRET,
        process.env.GOOGLE_RECAPTCHA_VALIDATION_URL
      );

      return await verifyRecaptcha(data);
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
