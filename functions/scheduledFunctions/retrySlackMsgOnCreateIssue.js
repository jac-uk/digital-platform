import { onSchedule } from 'firebase-functions/v2/scheduler';
import { auth, firebase, db } from '../shared/admin.js';
import initSlackActions from '../actions/slack.js';

export default onSchedule(
  {
    schedule: process.env.SLACK_RETRY_SCHEDULE ? process.env.SLACK_RETRY_SCHEDULE : 'every 2 minutes',
    region: 'europe-west2',
    timeZone: 'Europe/London',
    memory: '256MiB', // Adjust as needed
    timeoutSeconds: 540, // Maximum timeout for long-running tasks
    secrets: [
      'SLACK_TICKETING_APP_BOT_TOKEN',
      'SLACK_TICKETING_APP_CHANNEL_ID',
      'SLACK_URL',
    ],  // ✅ Ensure the function has access to the secrets
  },
  async (event) => {
    if (process.env.SLACK_TICKETING_APP_CHANNEL_ID) {

      const { retrySlackMessageOnCreateIssue } = initSlackActions(auth, db, firebase);

      const result = await retrySlackMessageOnCreateIssue(process.env.SLACK_TICKETING_APP_CHANNEL_ID);
      return result;
    }
    console.log('Cannot run scheduled task: retrySlackMessageOnCreateIssue due to missing process.env.SLACK_TICKETING_APP_CHANNEL_ID');
    return false;
  }
);
