const config = require('../shared/config');
const functions = require('firebase-functions');
const { backupAuthentication } = require('../actions/backup/authentication')(config);
const { wrapFunction } = require('../shared/sentry')(config);

const SCHEDULE = 'every day 23:00';

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(wrapFunction(async () => {
    const result = await backupAuthentication();
    return result;
  }));
