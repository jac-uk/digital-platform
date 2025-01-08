import config from '../shared/config.js';
import functions from 'firebase-functions/v1';
import { firebase } from '../shared/admin.js';
import initBackupFirestore from '../actions/backup/firestore.js';

const { backupFirestore } = initBackupFirestore(config, firebase);

const SCHEDULE = 'every day 23:01';

export default functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await backupFirestore();
    return result;
  });
