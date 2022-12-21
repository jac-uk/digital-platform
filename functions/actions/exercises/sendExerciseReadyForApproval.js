const { applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db, auth) => {
  const { newNotificationExerciseApprovalSubmit } = require('../../shared/factories')(config);
  return {
    sendExerciseReadyForApproval,
  };

  /**
    * sendExerciseReadyForApproval
    * Sends an 'approval requested' notification for an exercise
    * @param {*} `params` is an object containing
    *   `exerciseId`  (required) ID of exercise
    *   `exercise`    (required) exercise
    */
  async function sendExerciseReadyForApproval(params) {
    const exerciseId = params.exerciseId;
    const exercise = params.exercise;

    // create database commands
    const commands = [];
    // create notification
    commands.push({
      command: 'set',
      ref: db.collection('notifications').doc(),
      data: newNotificationExerciseApprovalSubmit(firebase, exerciseId, exercise),
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? true : false;
  }

};
