const functions = require('firebase-functions');
const config = require('../shared/config');
const { db, firebase } = require('../shared/admin');
const { getDocument } = require('../shared/helpers');
const { processNotifications } = require('../actions/notifications')(config, firebase, db);

const SCHEDULE = 'every 1 minutes synchronized';

const runtimeOptions = {
  memory: '256MB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await processNotifications();
    return result;
  });
