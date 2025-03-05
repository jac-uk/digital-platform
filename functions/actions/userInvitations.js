import { applyUpdates } from '../shared/helpers.js';
import initFactories from '../shared/factories.js';

export default (firebase, db) => {
  const { newNotificationUserInvitation } = initFactories();
  
  return {
    onUserInvitationCreate,
  };

  /**
   * User Invitation created evente handler
   * 
   * @param {object} ref
   * @param {string} userInvitationId
   * @param {object} userInvitation
   */
  async function onUserInvitationCreate(ref, userInvitationId, userInvitation) {
    const commands = [];
    if (
      userInvitation.status === 'pending' && 
      !(userInvitation.emailLog && userInvitation.emailLog.created)
    ) {
      commands.push(
        {
          command: 'set',
          ref: db.collection('notifications').doc(),
          data: newNotificationUserInvitation(firebase, userInvitationId, userInvitation),
        },
        {
          command: 'update',
          ref,
          data: {
            'emailLog.created': firebase.firestore.Timestamp.fromDate(new Date()),
          },
        }
      );
    }

    const result = await applyUpdates(db, commands);
    return result ? true : false;
  }
};
