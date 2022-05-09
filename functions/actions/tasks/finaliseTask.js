const { getDocument, getDocuments, getDocumentsFromQueries, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return finaliseTask;

  /**
  * finaliseTask
  * Finalises a task, collating all the final grades/scores so it is ready for updating application status and marking as complete
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type/ID of task
  */
  async function finaliseTask(params) {

    // get task
    const taskRef = db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`);
    const task = await getDocument(taskRef);
    if (!task) return 0;
    if ([config.TASK_STATUS.ACTIVATED, config.TASK_STATUS.MODERATION_ACTIVATED].indexOf(task.status) < 0) return 0;

    // get panels
    const panelQueries = task.panelIds.map(panelId => {
      return  db.collection('panels')
        .where(firebase.firestore.FieldPath.documentId(), '==', panelId)
        .select('scoreSheet', 'applicationIds', 'applications');
    });
    const panels = await getDocumentsFromQueries(panelQueries);

    // construct final scores
    const finalScores = [];
    panels.forEach(panel => {
      panel.applicationIds.forEach(applicationId => {
        const row = {
          id: applicationId,
          ref: panel.applications[applicationId].referenceNumber, // TODO extract only the last 7 chars
          panelId: panel.id,
          scoreSheet: finalScoreSheet(panel.scoreSheet[applicationId]),
          score: finalScore(task, panel.scoreSheet[applicationId]),
        };
        finalScores.push(row);
      });
    });

    // update task
    const commands = [];
    const taskData = {
      finalScores: finalScores,
    };
    taskData['status'] = config.TASK_STATUS.FINALISED;
    taskData[`statusLog.${config.TASK_STATUS.FINALISED}`] = firebase.firestore.FieldValue.serverTimestamp();
    commands.push({
      command: 'update',
      ref: taskRef,
      data: taskData,
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? finalScores.length : 0;

  }

  function finalScoreSheet(scoreSheet) {
    // for now we are simply removing `flagForModeration` flag in order to reduce object size
    delete scoreSheet.flagForModeration;
    return scoreSheet;
  }

  function finalScore(task, scoreSheet) {
    let score = 0;
    switch (task.type) {
      case config.TASK_TYPE.SIFT:
        task.capabilities.forEach(capability => score += config.GRADE_VALUES[scoreSheet[capability]]);
        break;
      case config.TASK_TYPE.SELECTION:
        task.selectionCategories.forEach(category => task.capabilities.forEach(capability => score += config.GRADE_VALUES[scoreSheet[category][capability]]));
        break;
    }
    return score;
  }

};
