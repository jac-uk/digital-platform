const { newNotificationUserInvitation } = require('../shared/factories');
module.exports = (config, firebase, db, auth) => {
  return {
    onUserInvitationCreate,
  };

  async function onUserInvitationCreate(invitationId, userInvitation) {
    // TODO: user credentials set-up link ?
    // TODO: create user document ?
    
    // TODO: create notification
    commands.push({
      command: 'set',
      ref: db.collection('notifications').doc(),
      data: newNotificationUserInvitation(firebase, invitationId, userInvitation, user),
    });
  }
};
