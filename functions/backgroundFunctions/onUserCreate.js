import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { firebase, db, auth } from '../shared/admin.js';
import initUsers from '../actions/users.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { onUserCreate } = initUsers(auth, db);
const { logEvent } = initLogEvent(firebase, db, auth);

export default onDocumentCreated('users/{userId}', (event) => {
  const snap = event.data;
  const details = {
    userId: event.params.userId,
  };
  logEvent('info', 'Application created', details);
  return onUserCreate(snap.ref, snap.data());
});
