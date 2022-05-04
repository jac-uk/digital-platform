const { getDocument, getDocuments, getDocumentsFromQueries, applyUpdates } = require('../../shared/helpers');

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
    if (!task.outcome) return 0;
    if (task.status !== config.TASK_STATUS.FINALISED) return 0;

    const outcomeStats = {};

    // update application records
    const commands = [];
    Object.entries(task.outcome).forEach(([key, value]) => {
      if (!outcomeStats[value]) {
        outcomeStats[value] = 1;
      } else {
        outcomeStats[value]++;
      }
      const saveData = {};
      saveData.status = value;
      saveData[`statusLog.${value}`] = firebase.firestore.FieldValue.serverTimestamp();
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(key),
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
