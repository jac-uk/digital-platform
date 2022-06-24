
// get scores
/**
 * send testId and receive
 *
 * [{
 *  ref,
 *  email,
 *  adjustment,
 *  score,
 * }]
 *
 */


const { getDocuments, getDocument } = require('../../../shared/helpers');

module.exports = (config, firebase, db) => {
  const qts = require('../../../shared/qts')(config);

  return updateQualifyingTestScores;

  /**
  * updateQualifyingTestScores
  * Get qualifying test scores and update task
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type`  (required) type/ID of task
  */
  async function updateQualifyingTestScores(params) {

    // get task
    const taskRef = db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`);
    const task = await getDocument(taskRef);
    if (!task) return { seccess: false, message: 'Task not found' };
    if (task.status !== config.TASK_STATUS.ACTIVATED) return { seccess: false, message: 'Task not activated' };

    // get scores from QT Platform
    const response = await qts.get('scores', {
      testId: task.testId,
    });
    if (!response.success) return { seccess: false, message: response.message };
    if (!response.scores) return { seccess: false, message: 'No scores available' };

    // update task
    const taskData = {};
    taskData.scores = response.scores;
    taskData.status = config.TASK_STATUS.FINALISED;
    taskData[`statusLog.${config.TASK_STATUS.FINALISED}`] = firebase.firestore.FieldValue.serverTimestamp();
    await taskRef.update(taskData);

    // return result
    return { success: response.success, message: response.message };

  }

};

