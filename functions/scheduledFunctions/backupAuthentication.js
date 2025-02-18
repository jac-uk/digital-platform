import { onSchedule } from 'firebase-functions/v2/scheduler';
import { firebase } from '../shared/admin.js';
import initBackupAuthentication from '../actions/backup/authentication.js';

import { defineSecret } from 'firebase-functions/params';
const SLACK_TICKETING_APP_BOT_TOKEN = defineSecret('SLACK_TICKETING_APP_BOT_TOKEN');

export default onSchedule(
  {
    schedule: '23 0 * * *', // Runs every day at 23:00 UTC (11:00 PM)
    region: 'europe-west2',
    timeZone: 'Europe/London',
    memory: '256MiB', // Adjust as needed
    timeoutSeconds: 540, // Maximum timeout for long-running tasks
    secrets: [SLACK_TICKETING_APP_BOT_TOKEN],  // ✅ Ensure the function has access to the secrets
  },
  async (event) => {
    console.log('Running scheduled backupAuthentication...');
    const { backupAuthentication } = initBackupAuthentication(process.env.SLACK_TICKETING_APP_BOT_TOKEN, firebase);
    const result = await backupAuthentication();
    return result;
  }
);
