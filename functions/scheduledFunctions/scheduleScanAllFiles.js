import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase } from '../shared/admin.js';
import initScanAllFiles from '../actions/malware-scanning/scanAllFiles.js';

const { scanAllFiles } = initScanAllFiles(config, firebase);

// const SCHEDULE = 'every day 02:00';
const SCHEDULE = 'every 1 hours'; // this setting is temporary
const runtimeOptions = {
  timeoutSeconds: 540, // maximum value is 540
  memory: '4GB',
};

export default functions.region('europe-west2')
  .runWith(runtimeOptions)
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    await scanAllFiles();
  });
