import * as functions from 'firebase-functions/v1';
import { firebase, db } from '../shared/admin.js';
import initMessages from '../actions/messages.js';

const { onMessageCreate } = initMessages(firebase, db);

export default functions.region('europe-west2').firestore
  .document('messages/{messageId}')
  .onCreate((snap, context) => {
    const messageId = context.params.messageId;
    return onMessageCreate(messageId, snap.data());
  });
