//const { getDocument, applyUpdates, isDateInPast, formatDate } = require('../../shared/helpers');

module.exports = (config, firebase, db, auth) => {
  const { sendExerciseReadyForApproval } = require('./sendExerciseReadyForApproval')(config, firebase, db, auth);
  const { updateVacancy, deleteVacancy } = require('../vacancies')(config, db);

  return onUpdate;

  /**
   * Exercise event handler for Update
   * - if status has changed due to submission for approval then send out notification email
   */
  async function onUpdate(exerciseId, dataBefore, dataAfter) {

    const isDraftOrReady = dataAfter.state === 'draft' || dataAfter.state === 'ready';
    const isPreviouslyApproved = '_approval' in dataAfter && 'approved' in dataAfter._approval && dataAfter._approval.approved;
    const isUnlocked = isDraftOrReady && isPreviouslyApproved;

    if (dataAfter.published === true) {
      if (!isUnlocked) {
        // Update the vacancy if the exercise is published but not in the unlocked state (as the changes will need approval first)
        await updateVacancy(exerciseId, dataAfter);
      }
    } else if (dataAfter.published === false) {
      if (dataBefore.published === true) {
        await deleteVacancy(exerciseId);
      }
    }

    // submitted for approval
    if (dataBefore.state === 'draft' && dataAfter.state === 'ready') {

      // send confirmation email (this can be sent multiple times if the submission was previously rejected for some reason)
      await sendExerciseReadyForApproval({
        exerciseId,
        exercise: dataAfter,
      });
    }

    return true;
  }
};
