const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db, auth } = require('../shared/admin');
const { onUserInvitationCreate } = require('../actions/userInvitations')(config, firebase, db, auth);
const { logEvent } = require('../actions/logs/logEvent')(firebase, db, auth);

module.exports = functions.region('europe-west2').firestore
  .document('userInvitations/{userInvitationId}')
  .onCreate((snap, context) => {
    const userInvitationId = context.params.userInvitationId;
    const details = {
      userInvitationId,
    };
    logEvent('info', 'UserInvitation created', details);
    return onUserInvitationCreate(snap.ref, userInvitationId, snap.data());
  });
