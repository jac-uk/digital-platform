import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { db, firebase } from '../shared/admin.js';
import initNotifications from '../actions/notifications.js';

const { processNotifications } = initNotifications(config, firebase, db);
const SCHEDULE = 'every 1 minutes synchronized';

export default functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await processNotifications();
    return result;
  });
