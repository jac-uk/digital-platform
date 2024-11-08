export default (config) => {
  const EXERCISE_STAGE = config.EXERCISE_STAGE;
  return {
    availableStages,
    canApplyFullApplicationSubmitted,
  };

  function availableStages(exercise) {
    const stages = [];
    if (!exercise) return stages;
    if (exercise._processingVersion >= 2) {
      stages.push(EXERCISE_STAGE.SHORTLISTING);
      stages.push(EXERCISE_STAGE.SELECTION);
      stages.push(EXERCISE_STAGE.SCC);
      stages.push(EXERCISE_STAGE.RECOMMENDATION);
    } else {
      stages.push(EXERCISE_STAGE.REVIEW);
      stages.push(EXERCISE_STAGE.SHORTLISTED);
      stages.push(EXERCISE_STAGE.SELECTED);
      stages.push(EXERCISE_STAGE.RECOMMENDED);
      stages.push(EXERCISE_STAGE.HANDOVER);
    }
    return stages;
  }

  function canApplyFullApplicationSubmitted(exercise) {
    if (!exercise) return false;
  
    const selectionProcess = exercise._applicationContent.selection || {};
    const isStagedExercise = Object.values(selectionProcess).includes(true);
    const applyFullApplicationSubmitted = isStagedExercise && exercise.applicationOpenDate.toDate() >= new Date(2024, 7, 18);
    console.log('selectionProcess', JSON.stringify(selectionProcess));
    console.log('isStagedExercise', isStagedExercise);
    console.log('applyFillApplicationSubmitted', applyFullApplicationSubmitted);
   
    return applyFullApplicationSubmitted;
  }
  
};
