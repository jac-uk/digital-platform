const config = require('../shared/config');
const functions = require('firebase-functions');
const { firebase } = require('../shared/admin');
const { backupAuthentication } = require('../actions/backup/authentication')(config, firebase);

const SCHEDULE = 'every day 23:00';

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await backupAuthentication();
    return result;
  });
