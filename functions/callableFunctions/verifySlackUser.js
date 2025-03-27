import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, auth, firebase } from '../shared/admin.js';
import { objectHasNestedProperty } from '../shared/helpers.js';
import { checkArguments } from '../shared/helpers.js';
import initServiceSettings from '../shared/serviceSettings.js';
import initSlack from '../actions/slack.js';

const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    secrets: [
      'SLACK_TICKETING_APP_BOT_TOKEN',
      'SLACK_URL',
    ],  // ✅ Ensure the function has access to the secrets
  },
  async (request) => {

    try {
      const data = request.data;

      await checkFunctionEnabled();

      // authenticate the request
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      if (!checkArguments({
        userId: { required: true },
        slackMemberId: { required: true },
        addSlackToProfile: { required: true },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }

      const slack = initSlack(auth, db, firebase);
      const addSlackIdToUserRecord = objectHasNestedProperty(data, 'addSlackToProfile') && data.addSlackToProfile;
      return await slack.lookupSlackUser(data.userId, data.slackMemberId, addSlackIdToUserRecord);
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);

