const config = require('../shared/config');
const functions = require('firebase-functions');
const { firebase } = require('../shared/admin');
const { runScannerTest } = require('../actions/malware-scanning/runScannerTest.js')(config, firebase);

const SCHEDULE = config.SCANNER_TEST_SCHEDULE ? config.SCANNER_TEST_SCHEDULE : 'every 10 minutes';

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await runScannerTest();
    return result;
  });
