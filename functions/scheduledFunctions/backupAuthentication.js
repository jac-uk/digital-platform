import config from '../shared/config.js';
import functions from 'firebase-functions';
import { firebase } from '../shared/admin.js';
import initBackupAuthentication from '../actions/backup/authentication.js';

const { backupAuthentication } = initBackupAuthentication(config, firebase);

const SCHEDULE = 'every day 23:00';

export default functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await backupAuthentication();
    return result;
  });
