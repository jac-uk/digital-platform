const functions = require('firebase-functions');
const { scanAllFiles } = require('../actions/malware-scanning/scanAllFiles');

const SCHEDULE = 'every sunday 02:00';

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    scanAllFiles();
  });