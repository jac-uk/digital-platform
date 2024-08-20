import { applyUpdates } from '../../shared/helpers.js';
import initFactories from '../../shared/factories.js';

export default (config, firebase, db, auth) => {
  const { newNotificationExerciseApprovalSubmit } = initFactories(config);
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
    const toEmails = exercise.seniorSelectionExerciseManager;

    // create database commands
    const commands = [];

    toEmails.forEach(emailObj => {
      const email = emailObj.name;  // @todo: This should use an appropriate key instead of 'name' as it's misleading

      // create notification
      commands.push({
        command: 'set',
        ref: db.collection('notifications').doc(),
        data: newNotificationExerciseApprovalSubmit(firebase, exerciseId, exercise, email),
      });
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? true : false;
  }

};
