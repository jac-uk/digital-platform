import * as functions from 'firebase-functions/v1';
import { firebase, db, auth } from '../shared/admin.js';
import initUserInvitations from '../actions/userInvitations.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { onUserInvitationCreate } = initUserInvitations(firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);

export default functions.region('europe-west2').firestore
  .document('userInvitations/{userInvitationId}')
  .onCreate((snap, context) => {
    const userInvitationId = context.params.userInvitationId;
    const details = {
      userInvitationId,
    };
    logEvent('info', 'UserInvitation created', details);
    return onUserInvitationCreate(snap.ref, userInvitationId, snap.data());
  });
