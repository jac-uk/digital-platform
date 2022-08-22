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
    if ([config.TASK_STATUS.PANELS_ACTIVATED, config.TASK_STATUS.MODERATION_ACTIVATED].indexOf(task.status) < 0) return 0;

    // get panels
    const panelQueries = task.panelIds.map(panelId => {
      return  db.collection('panels')
        .where(firebase.firestore.FieldPath.documentId(), '==', panelId)
        .select('scoreSheet', 'applicationIds', 'applications');
    });
    const panels = await getDocumentsFromQueries(panelQueries);

    // construct final scores
    // TODO change to `.applications` and `.scores`
    const finalScores = [];
    panels.forEach(panel => {
      panel.applicationIds.forEach(applicationId => {
        const row = {
          id: applicationId,
          ref: panel.applications[applicationId].referenceNumber, // TODO extract only the last 7 chars
          panelId: panel.id,
          scoreSheet: finaliseScoreSheet(task.markingScheme, panel.scoreSheet[applicationId]),
          score: getScoreSheetTotal(task.markingScheme, panel.scoreSheet[applicationId]),
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

  function finaliseScoreSheet(markingScheme, scoreSheet) {
    if (!markingScheme) return scoreSheet;
    if (!scoreSheet) return scoreSheet;
    delete scoreSheet.flagForModeration;  //  removing `flagForModeration` flag in order to reduce object size
    markingScheme.forEach(item => {
      if (item.type === config.MARKING_TYPE.GROUP) {
        scoreSheet[item.ref].score = 0;
        item.children.forEach(child => {
          scoreSheet[item.ref].score += getScoreSheetItemTotal(child, scoreSheet[item.ref]);
        });
      }
    });
    return scoreSheet;
  }

  function getScoreSheetTotal(markingScheme, scoreSheet) {
    let score = 0;
    if (!markingScheme) return score;
    if (!scoreSheet) return score;
    markingScheme.forEach(item => {
      if (item.type === config.MARKING_TYPE.GROUP) {
        item.children.forEach(child => {
          score += getScoreSheetItemTotal(child, scoreSheet[item.ref]);
        });
      } else {
        score += getScoreSheetItemTotal(item, scoreSheet);
      }
    });
    return score;
  }

  function getScoreSheetItemTotal(item, scoreSheet) {
    if (!item.excludeFromScore) {
      switch (item.type) {
      case config.MARKING_TYPE.GRADE:
        if (scoreSheet[item.ref] && config.GRADE_VALUES[scoreSheet[item.ref]]) {
          return config.GRADE_VALUES[scoreSheet[item.ref]];
        }
        break;
      case config.MARKING_TYPE.NUMBER:
        if (scoreSheet[item.ref]) {
          return scoreSheet[item.ref];
        }
        break;
      }
    }
    return 0;
  }
};
