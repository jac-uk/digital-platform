import { objectHasNestedProperty } from '../../shared/helpers.js';
import initSendExerciseReadyForApproval from './sendExerciseReadyForApproval.js';
import initVacancies from '../vacancies.js';
import initExercises from './exercises.js';
import { getSearchMap } from '../../shared/search.js';

export default (config, firebase, db, auth) => {
  const { sendExerciseReadyForApproval } = initSendExerciseReadyForApproval(config, firebase, db, auth);
  const { updateVacancy, deleteVacancy } = initVacancies(config, db);
  const { updateExercise } = initExercises(db);

  return onUpdate;

  /**
   * Exercise event handler for Update
   * - if status has changed due to submission for approval then send out notification email
   */
  async function onUpdate(exerciseId, dataBefore, dataAfter) {

    const isDraftOrReady = dataAfter.state === 'draft' || dataAfter.state === 'ready';
    const isPreviouslyApproved = objectHasNestedProperty(dataAfter, '_approval.initialApprovalDate');
    const isUnlocked = isDraftOrReady && isPreviouslyApproved;
    const canPostWithoutApproval = ['listing'].includes(dataAfter.advertType);
    const isPublishedChanged = dataBefore.published !== dataAfter.published;

    if (!isUnlocked || canPostWithoutApproval || isPublishedChanged) {
      // Update the vacancy if the exercise is published but not in the unlocked state (as the changes will need approval first)
      await updateVacancy(exerciseId, dataAfter);
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
