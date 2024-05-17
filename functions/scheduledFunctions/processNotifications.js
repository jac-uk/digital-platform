const functions = require('firebase-functions');
const config = require('../shared/config');
const { db } = require('../shared/admin');
const { getDocument } = require('../shared/helpers');
const { processNotifications } = require('../actions/notifications')(config, db);

const SCHEDULE = 'every 1 minutes synchronized';

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await processNotifications();
    return result;
  });
