import config from '../shared/config.js';
import * as functions from 'firebase-functions/v1';
import { firebase, db } from '../shared/admin.js';
import runScannerTestInit from '../actions/malware-scanning/runScannerTest.js';

const runScannerTest = runScannerTestInit(config, firebase, db);

const SCHEDULE = config.SCANNER_TEST_SCHEDULE ? config.SCANNER_TEST_SCHEDULE : 'every 10 minutes';

export default functions
  .region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await runScannerTest();
    return result;
  });
