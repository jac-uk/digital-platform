import { onSchedule } from 'firebase-functions/v2/scheduler';
import { firebase } from '../shared/admin.js';
import initBackupAuthentication from '../actions/backup/authentication.js';

export default onSchedule(
  {
    schedule: '23 0 * * *', // Runs every day at 23:00 UTC (11:00 PM)
    region: 'europe-west2',
    timeZone: 'Europe/London',
    memory: '256MiB', // Adjust as needed
    timeoutSeconds: 540, // Maximum timeout for long-running tasks
    secrets: [
      'SLACK_TICKETING_APP_BOT_TOKEN',
      'SLACK_URL',
    ],  // ✅ Ensure the function has access to the secrets
  },
  async (event) => {
    console.log('Running scheduled backupAuthentication...');
    const { backupAuthentication } = initBackupAuthentication(firebase);
    const result = await backupAuthentication();
    return result;
  }
);
