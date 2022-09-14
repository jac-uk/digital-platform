const functions = require('firebase-functions');
const config = require('../shared/config');
const { db, firebase } = require('../shared/admin');
const { getDocument } = require('../shared/helpers');
const { processNotifications } = require('../actions/notifications')(config, firebase, db);
const { wrapFunction } = require('../shared/sentry')(config);

const SCHEDULE = 'every 1 minutes synchronized';

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(wrapFunction(async () => {
    const result = await processNotifications();
    return result;
  }));
