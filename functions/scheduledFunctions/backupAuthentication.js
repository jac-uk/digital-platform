const config = require('../shared/config');
const functions = require('firebase-functions');
const { backupAuthentication } = require('../actions/backup/authentication')(config);

const SCHEDULE = 'every day 23:00';

const runtimeOptions = {
  memory: '256MB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await backupAuthentication();
    return result;
  });
