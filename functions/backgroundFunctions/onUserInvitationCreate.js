import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { firebase, db, auth } from '../shared/admin.js';
import initUserInvitations from '../actions/userInvitations.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { onUserInvitationCreate } = initUserInvitations(firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);

export default onDocumentCreated('userInvitations/{userInvitationId}', (event) => {
  const snap = event.data;
  const userInvitationId = event.params.userInvitationId;
  const details = {
    userInvitationId,
  };
  logEvent('info', 'UserInvitation created', details);
  return onUserInvitationCreate(snap.ref, userInvitationId, snap.data());
});
