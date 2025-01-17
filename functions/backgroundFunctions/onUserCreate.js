import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import initUsers from '../actions/users.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { onUserCreate } = initUsers(config, firebase, db, auth);
const { logEvent } = initLogEvent(firebase, db, auth);

export default functions.region('europe-west2').firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    const details = {
      userId: context.params.userId,
    };

    logEvent('info', 'Application created', details);
    return onUserCreate(snap.ref, snap.data());
  });
