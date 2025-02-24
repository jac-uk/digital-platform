import { getDocument, applyUpdates } from '../../../shared/helpers.js';
import initQts from '../../../shared/qts.js';
import { TASK_TYPE, TASK_STATUS } from '../../../shared/constants.js';
export default (qtKey, firebase, db) => {
  const qts = initQts(qtKey);

  return updateQualifyingTestScores;

  /**
  * updateQualifyingTestScores
  * Get qualifying test scores (if available) and update task
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type`  (required) type/ID of task
  */
  async function updateQualifyingTestScores(params) {

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`));
    if (!exercise) return 0;

    // get task
    const taskRef = db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`);
    const task = await getDocument(taskRef);
    if (!task) return { success: false, message: 'Task not found' };
    if (task.status !== TASK_STATUS.TEST_ACTIVATED) return { success: false, message: 'Task not activated' };

    // get results from QT Platform
    const response = await qts.get('scores', {
      testId: task.test.id,
    });
    if (!response.success) return { success: false, message: response.message };

    // update task
    const taskData = {};
    let nextStatus;
    if ([TASK_TYPE.CRITICAL_ANALYSIS, TASK_TYPE.SITUATIONAL_JUDGEMENT].indexOf(task.type) >= 0) {
      if (!response.scores) return { success: false, message: 'No scores available' };
      if (!Object.keys(response.scores).length) return { success: false, message: 'No scores available' };
        // construct finalScores
      const finalScores = [];
      task.applications.forEach(application => {
        finalScores.push({
          id: application.id,
          ref: application.ref,
          score: response.scores[application.id],
        });
      });
      taskData.finalScores = finalScores;
      nextStatus = TASK_STATUS.FINALISED;
    }
    if (task.type === TASK_TYPE.SCENARIO) {
      if (!response.questionIds) return { success: false, message: 'No question ids available' };
      nextStatus = TASK_STATUS.PANELS_INITIALISED;
      taskData.emptyScoreSheet = getEmptyScoreSheet(response.questionIds);
      taskData.markingScheme = scoreSheet2MarkingScheme(taskData.emptyScoreSheet);
      taskData['test.questionIds'] = response.questionIds;
      // TODO? get status of test so we know whether any candidates did not take the test

      // update application records with placeholder for panelId
      const commands = [];
      task.applications.forEach(application => {
        const data = {};
        data[`${params.type}.panelId`] = null;
        commands.push({
          command: 'update',
          ref: db.collection('applicationRecords').doc(application.id),
          data: data,
        });
      });
      await applyUpdates(db, commands);
    }
    if (!nextStatus) return { success: false, message: 'Task type not recognised' };

    taskData.status = nextStatus;
    taskData[`statusLog.${nextStatus}`] = firebase.firestore.FieldValue.serverTimestamp();
    await taskRef.update(taskData);

    // return result
    return { success: true, message: 'Task updated' };

  }

  // function arrayToObject(arrData) {
  //   const returnObject = {};
  //   arrData.forEach(item => returnObject[item] = '');
  //   return returnObject;
  // }

  function getEmptyScoreSheet(arrData) {
    const returnObject = {};
    arrData.forEach(item => {
      if (item.indexOf('.') >= 0) {
        const parts = item.split('.');
        if (!returnObject[parts[0]]) returnObject[parts[0]] = {};
        returnObject[parts[0]][parts[1]] = '';
      } else {
        returnObject[item] = '';
      }
    });
    return returnObject;
  }

  function scoreSheet2MarkingScheme(scoreSheet) {
    const markingScheme = [];
    Object.keys(scoreSheet).forEach(key => {
      if (typeof scoreSheet[key] === 'object') {
        const children = [];
        Object.keys(scoreSheet[key]).forEach(childKey => {
          children.push({
            ref: childKey,
            type: 'number',
          });
        });
        markingScheme.push({
          ref: key,
          type: 'group',
          children: children,
        });
      } else {
        markingScheme.push({
          ref: key,
          type: 'number',
        });
      }
    });
    return markingScheme;
  }

};

