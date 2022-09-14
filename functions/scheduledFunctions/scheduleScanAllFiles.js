const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase } = require('../shared/admin');
const { scanAllFiles } = require('../actions/malware-scanning/scanAllFiles')(config, firebase);
const { wrapFunction } = require('../shared/sentry')(config);

// const SCHEDULE = 'every day 02:00';
const SCHEDULE = 'every 1 hours'; // this setting is temporary
const runtimeOptions = {
  timeoutSeconds: 540, // maximum value is 540
  memory: '2GB',
};

module.exports = functions.region('europe-west2')
  .runWith(runtimeOptions)
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(wrapFunction(async () => {
    await scanAllFiles();
  }));
