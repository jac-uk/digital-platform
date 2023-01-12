module.exports = (config, firebase, db, auth) => {
  const { addLateApplicationRequest, removeLateApplicationRequest } = require('./exercises/updateLateApplicationRequests')(firebase, db);

  return {
    onMessageCreate,
  };

  /**
   * Message created event handler
   * - Checks type of message
   * - For type = lateApplicationRequest ensure the candidate id is added to the _lateApplicationRequests field in the exercise
   * - For type = lateApplicationApproval ensure the candidate id is removed from the _lateApplicationRequests field in the exercise
   */
  async function onMessageCreate(type, exerciseId, candidateId) {
    if (type === 'lateApplicationRequest') {
      await addLateApplicationRequest(exerciseId, candidateId);
    }
    else if (type === 'lateApplicationApproval') {
      await removeLateApplicationRequest(exerciseId, candidateId);
    }
  }
};
