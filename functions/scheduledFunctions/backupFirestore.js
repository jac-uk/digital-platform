import { onSchedule } from 'firebase-functions/v2/scheduler';
import { firebase } from '../shared/admin.js';
import initBackupFirestore from '../actions/backup/firestore.js';

const SCHEDULE = 'every day 23:01';

export default onSchedule(
  {
    schedule: SCHEDULE,
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
    const { backupFirestore } = initBackupFirestore(
      process.env.SLACK_TICKETING_APP_BOT_TOKEN,
      firebase
    );
    const result = await backupFirestore();
    return result;
  }
);
