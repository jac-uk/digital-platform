const { objectHasNestedProperty } = require('../../shared/helpers');

module.exports = (config, db, auth) => {
  const { sendExerciseReadyForApproval } = require('./sendExerciseReadyForApproval')(config, db, auth);
  const { updateVacancy, deleteVacancy } = require('../vacancies')(config, db);
  const { updateExercise } = require('./exercises')(db);
  const { getSearchMap } = require('../../shared/search');

  return onUpdate;

  /**
   * Exercise event handler for Update
   * - if status has changed due to submission for approval then send out notification email
   */
  async function onUpdate(exerciseId, dataBefore, dataAfter) {

    const isDraftOrReady = dataAfter.state === 'draft' || dataAfter.state === 'ready';
    const isPreviouslyApproved = objectHasNestedProperty(dataAfter, '_approval.initialApprovalDate');
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

    // Update search map if searchable keys have changed (ie name/ref no)
    const hasUpdatedName = dataBefore.name !== dataAfter.name;
    const hasUpdatedReferenceNumber = dataBefore.referenceNumber !== dataAfter.referenceNumber;
    if (hasUpdatedName || hasUpdatedReferenceNumber) {
      // Update search map
      const data = {};
      data._search = getSearchMap([dataAfter.name, dataAfter.referenceNumber]);
      updateExercise(exerciseId, data);
    }

    return true;
  }
};
