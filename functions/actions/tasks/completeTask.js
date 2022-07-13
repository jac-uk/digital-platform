const { getDocument, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return completeTask;

  /**
  * completeTask
  * Completes a task, updating the status of applications and ensuring it is locked from further changes
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type/ID of task
  */
  async function completeTask(params) {

    // get task
    const taskRef = db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`);
    const task = await getDocument(taskRef);
    if (!task) return 0;
    if (!task.passMark) return 0;
    if (task.status !== config.TASK_STATUS.FINALISED) return 0;

    const outcomeStats = {};
    const passStatus = `${params.type}Passed`;
    const failStatus = `${params.type}Failed`;
    outcomeStats[passStatus] = 0;
    outcomeStats[failStatus] = 0;

    // update application records
    const commands = [];
    task.finalScores.forEach(scoreData => {
      let newStatus;
      if (scoreData.score >= task.passMark) {
        newStatus = passStatus;
      } else {
        newStatus = failStatus;
      }
      outcomeStats[newStatus] += 1;
      const saveData = {};
      saveData.status = newStatus;
      saveData[`statusLog.${newStatus}`] = firebase.firestore.FieldValue.serverTimestamp();
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(scoreData.id),
        data: saveData,
      });
    });

    // update task
    const taskData = {};
    taskData['status'] = config.TASK_STATUS.COMPLETED;
    taskData[`statusLog.${config.TASK_STATUS.COMPLETED}`] = firebase.firestore.FieldValue.serverTimestamp();
    taskData['_stats.totalForEachOutcome'] = outcomeStats;
    commands.push({
      command: 'update',
      ref: taskRef,
      data: taskData,
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? commands.length : 0;

  }

};
