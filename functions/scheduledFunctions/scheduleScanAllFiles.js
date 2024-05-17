const functions = require('firebase-functions');
const config = require('../shared/config');
const { app, storage } = require('../shared/admin');
const { scanAllFiles } = require('../actions/malware-scanning/scanAllFiles')(config, app, storage);

// const SCHEDULE = 'every day 02:00';
const SCHEDULE = 'every 1 hours'; // this setting is temporary
const runtimeOptions = {
  timeoutSeconds: 540, // maximum value is 540
  memory: '4GB',
};

module.exports = functions.region('europe-west2')
  .runWith(runtimeOptions)
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    await scanAllFiles();
  });
