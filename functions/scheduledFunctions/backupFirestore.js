const functions = require('firebase-functions');
const config = require('../shared/config');
const { backupFirestore } = require('../actions/backup/firestore')(config);

const SCHEDULE = 'every day 23:00';

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await backupFirestore();
    return result;
  });
