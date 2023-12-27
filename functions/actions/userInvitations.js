const { applyUpdates } = require('../shared/helpers');
module.exports = (config, firebase, db, auth) => {
  const { newNotificationUserInvitation } = require('../shared/factories')(config);
  
  return {
    onUserInvitationCreate,
  };

  async function onUserInvitationCreate(invitationId, userInvitation) {
    const commands = [];
    commands.push({
      command: 'set',
      ref: db.collection('notifications').doc(),
      data: newNotificationUserInvitation(firebase, invitationId, userInvitation),
    });
    // write to db
    const result = await applyUpdates(db, commands);

    return result;
  }
};
