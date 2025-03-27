import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db, firebase } from '../shared/admin.js';
import initNotifications from '../actions/notifications.js';

const SCHEDULE = 'every 1 minutes synchronized';

export default onSchedule(
  {
    schedule: SCHEDULE,
    region: 'europe-west2',
    timeZone: 'Europe/London',
    memory: '256MiB', // Adjust as needed
    timeoutSeconds: 540, // Maximum timeout for long-running tasks
    secrets: [ 'NOTIFY_KEY' ],  // ✅ Ensure the function has access to the secrets
  },
  async (event) => {
    const { processNotifications } = initNotifications(firebase, db);
    const result = await processNotifications();
    return result;
  }
);

