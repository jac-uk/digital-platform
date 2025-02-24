import { onSchedule } from 'firebase-functions/v2/scheduler';
import { firebase, db } from '../shared/admin.js';
import runScannerTestInit from '../actions/malware-scanning/runScannerTest.js';

const runScannerTest = runScannerTestInit(firebase, db);

const SCHEDULE = process.env.SCANNER_TEST_SCHEDULE ? process.env.SCANNER_TEST_SCHEDULE : 'every 10 minutes';

export default onSchedule(
  {
    schedule: SCHEDULE,
    region: 'europe-west2',
    timeZone: 'Europe/London',
    memory: '256MiB', // Adjust as needed
    timeoutSeconds: 540, // Maximum timeout for long-running tasks
  },
  async (event) => {
    const result = await runScannerTest();
    return result;
  }
);
