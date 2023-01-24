module.exports = (config, firebase, db, auth) => {
  const { addLateApplicationRequest, removeLateApplicationRequest } = require('./exercises/updateLateApplicationRequests')(firebase, db);
  const { newNotificationLateApplicationRequest, newNotificationLateApplicationResponse } = require('../shared/factories')(config);
  const { applyUpdates } = require('../shared/helpers');

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
    const msgType = message.hasOwnProperty('type') ? message.type : null;
    const candidateId = msgType ? message[msgType].candidateId : null;
    const exerciseId = msgType ? message[msgType].exerciseId : null;
    const toEmails = message.to;

    // create database commands
    const commands = [];

    if (message.hasOwnProperty('type')) {
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
