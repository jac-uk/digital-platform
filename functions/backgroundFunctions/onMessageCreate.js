import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import initMessages from '../actions/messages.js';

const { onMessageCreate } = initMessages(config, firebase, db, auth);

export default functions.region('europe-west2').firestore
  .document('messages/{messageId}')
  .onCreate((snap, context) => {
    const messageId = context.params.messageId;
    return onMessageCreate(messageId, snap.data());
  });
