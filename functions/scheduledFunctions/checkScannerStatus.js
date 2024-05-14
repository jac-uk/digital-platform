const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase } = require('../shared/admin');
const { checkScannerStatus } = require('../actions/malware-scanning/checkScannerStatus')(config, firebase);

// const SCHEDULE = 'every day 02:00';
const SCHEDULE = 'every 2 hours'; // this setting is temporary
const runtimeOptions = {
  timeoutSeconds: 540, // maximum value is 540
  memory: '500MB',
};

module.exports = functions.region('europe-west2')
  .runWith(runtimeOptions)
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    await checkScannerStatus();
  });
