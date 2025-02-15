import { onSchedule } from 'firebase-functions/v2/scheduler';
import { firebase } from '../shared/admin.js';

import initScanAllFiles from '../actions/malware-scanning/scanAllFiles.js';

const { scanAllFiles } = initScanAllFiles(firebase);

// const SCHEDULE = 'every day 02:00';
const SCHEDULE = 'every 1 hours'; // this setting is temporary

export default onSchedule(
  {
    schedule: SCHEDULE,
    region: 'europe-west2',
    timeZone: 'Europe/London',
    memory: '4GB', // Adjust as needed
    timeoutSeconds: 540, // Maximum timeout for long-running tasks
    //secrets: [NOTIFY_KEY],  // ✅ Ensure the function has access to the secrets
  },
  async (event) => {
    await scanAllFiles();
  }
);
