const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase } = require('../shared/admin');
const { scanAllFiles } = require('../actions/malware-scanning/scanAllFiles')(config, firebase);

// const SCHEDULE = 'every day 02:00';
const SCHEDULE = 'every 1 hours'; // this setting is temporary

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    scanAllFiles();
  });
