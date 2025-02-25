import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { firebase, db } from '../shared/admin.js';
import initMessages from '../actions/messages.js';

const { onMessageCreate } = initMessages(firebase, db);

export default onDocumentCreated('messages/{messageId}', (event) => {
  const snap = event.data;
  const messageId = event.params.messageId;
  return onMessageCreate(messageId, snap.data());
});
