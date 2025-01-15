import { applyUpdates } from '../shared/helpers.js';
import initUpdateLateApplicationRequests from './exercises/updateLateApplicationRequests.js';
import initFactories from '../shared/factories.js';

export default (config, firebase, db, auth) => {
  const { addLateApplicationRequest, removeLateApplicationRequest } = initUpdateLateApplicationRequests(firebase, db);
  const { newNotificationLateApplicationRequest, newNotificationLateApplicationResponse } = initFactories(config);

  return {
    onMessageCreate,
  };

  /**
   * Message created event handler
   * - Checks type of message
   * - For type = lateApplicationRequest ensure the candidate id is added to the _lateApplicationRequests field in the exercise
   * - For type = lateApplicationResponse ensure the candidate id is removed from the _lateApplicationRequests field in the exercise
   */
  async function onMessageCreate(messageId, message) {
    const msgHasTypeProperty = Object.prototype.hasOwnProperty.call(message, 'type');
    const msgType = msgHasTypeProperty ? message.type : null;
    const candidateId = msgHasTypeProperty ? message[msgType].candidateId : null;
    const exerciseId = msgHasTypeProperty ? message[msgType].exerciseId : null;
    const toEmails = message.to;

    // create database commands
    const commands = [];

    if (msgHasTypeProperty) {
      if (msgType === 'lateApplicationRequest') {
        await addLateApplicationRequest(exerciseId, candidateId);
        for (const toEmail of toEmails) {

          // create notification
          commands.push({
            command: 'set',
            ref: db.collection('notifications').doc(),
            data: newNotificationLateApplicationRequest(firebase, messageId, message, toEmail),
          });
        }
      }
      else if (msgType === 'lateApplicationResponse') {
        await removeLateApplicationRequest(exerciseId, candidateId);
        for (const toEmail of toEmails) {

          // create notification
          commands.push({
            command: 'set',
            ref: db.collection('notifications').doc(),
            data: newNotificationLateApplicationResponse(firebase, messageId, message, toEmail),
          });
        }
      }
    }
    
    // write to db
    if (commands.length) {
      const result = await applyUpdates(db, commands);
      return result ? true : false;
    }
    return true;
  }
};
