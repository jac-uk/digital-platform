import { onSchedule } from 'firebase-functions/v2/scheduler';
import { auth, firebase, db } from '../shared/admin.js';
import initSlackActions from '../actions/slack.js';
import { SLACK_RETRY_SCHEDULE, SLACK_TICKETING_APP_CHANNEL_ID } from '../shared/config.js';
const SCHEDULE = SLACK_RETRY_SCHEDULE ? SLACK_RETRY_SCHEDULE : 'every 2 minutes';

import { defineSecret } from 'firebase-functions/params';
const SLACK_TICKETING_APP_BOT_TOKEN = defineSecret('SLACK_TICKETING_APP_BOT_TOKEN');

export default onSchedule(
  {
    schedule: SCHEDULE,
    region: 'europe-west2',
    timeZone: 'Europe/London',
    memory: '256MB', // Adjust as needed
    timeoutSeconds: 540, // Maximum timeout for long-running tasks
    secrets: [SLACK_TICKETING_APP_BOT_TOKEN],  // ✅ Ensure the function has access to the secrets
  },
  async (event) => {
    if (SLACK_TICKETING_APP_CHANNEL_ID) {

      const { retrySlackMessageOnCreateIssue } = initSlackActions(
        process.env.SLACK_TICKETING_APP_BOT_TOKEN,
        auth,
        db,
        firebase
      );

      const result = await retrySlackMessageOnCreateIssue(SLACK_TICKETING_APP_CHANNEL_ID);
      return result;
    }
    console.log('Cannot run scheduled task: retrySlackMessageOnCreateIssue due to missing SLACK_TICKETING_APP_CHANNEL_ID');
    return false;
  }
);
