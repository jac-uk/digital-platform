import { onSchedule } from 'firebase-functions/v2/scheduler';
import { firebase } from '../shared/admin.js';
import initBackupFirestore from '../actions/backup/firestore.js';

import { defineSecret } from 'firebase-functions/params';
const SLACK_TICKETING_APP_BOT_TOKEN = defineSecret('SLACK_TICKETING_APP_BOT_TOKEN');

const SCHEDULE = 'every day 23:01';

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
    const { backupFirestore } = initBackupFirestore(
      process.env.SLACK_TICKETING_APP_BOT_TOKEN,
      firebase
    );
    const result = await backupFirestore();
    return result;
  }
);
