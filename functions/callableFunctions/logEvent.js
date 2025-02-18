import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db, auth } from '../shared/admin.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { logEvent } = initLogEvent(firebase, db, auth);
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
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      // validate input parameters
      if (!(typeof data.type === 'string') || data.type.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify an event type');
      }
      let validEventTypes = ['info', 'error', 'warning'];
      if (!validEventTypes.includes(data.type)) {
        throw new HttpsError('invalid-argument', 'The event type is invalid');
      }
      if (!(typeof data.description === 'string') || data.description.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify an event description');
      }

      if (typeof data.details !== 'object') {
        throw new HttpsError('invalid-argument', 'Please specify the event details');
      }

      let user = {
        id: request.auth.token.user_id,
        name: request.auth.token.name || null, // name might not be set
        email: request.auth.token.email || null,
      };

      // generate the report
      const result = await logEvent(data.type, data.description, data.details, user);
      return {
        result: result,
      };
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
