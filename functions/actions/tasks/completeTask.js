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

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`));
    if (!exercise) return 0;

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
      // TODO update stage too?
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

    // check for qualifying test follow on task
    if (params.type === config.TASK_TYPE.CRITICAL_ANALYSIS || params.type === config.TASK_TYPE.SITUATIONAL_JUDGEMENT) {
      if (
        exercise.shortlistingMethods.indexOf('critical-analysis-qualifying-test') >= 0 && exercise.criticalAnalysisTestDate
        && exercise.shortlistingMethods.indexOf('situational-judgement-qualifying-test') >= 0 && exercise.situationalJudgementTestDate
      ) {
        // get the other QT task
        const otherTaskType = params.type === config.TASK_TYPE.CRITICAL_ANALYSIS ? config.TASK_TYPE.SITUATIONAL_JUDGEMENT : config.TASK_TYPE.CRITICAL_ANALYSIS;
        const otherTask = await getDocument(db.doc(`exercises/${params.exerciseId}/tasks/${otherTaskType}`));
        if (otherTask.status === config.TASK_STATUS.COMPLETED) {
          // create qualifying test task
          const finalScores = [];
          task.finalScores.forEach(scoreData => {
            if (scoreData.score >= task.passMark) {
              const otherTaskScoreData = otherTask.finalScores.find(otherScoreData => otherScoreData.id === scoreData.id);
              if (otherTaskScoreData && otherTaskScoreData.score >= otherTask.passMark) {
                const overallScore = 50 * ((scoreData.score / task.maxScore) + (otherTaskScoreData.score / otherTask.maxScore));
                finalScores.push({
                  id: scoreData.id,
                  ref: scoreData.ref,
                  score: overallScore,
                  scoreSheet: {
                    qualifyingTest: {
                      CA: params.type === config.TASK_TYPE.CRITICAL_ANALYSIS ? scoreData.score : otherTaskScoreData.score,
                      SJ: params.type === config.TASK_TYPE.CRITICAL_ANALYSIS ? otherTaskScoreData.score : scoreData.score,
                      score: overallScore,
                    },
                  },
                });
              }
            }
          });
          const taskData = {
            _stats: {},
            finalScores: finalScores,
            markingScheme: [
              {
                ref: config.TASK_TYPE.QUALIFYING_TEST,
                type: 'group',
                children: [
                  {
                    ref: 'CA',
                    type: 'number',
                  },
                  {
                    ref: 'SJ',
                    type: 'number',
                  },
                ],
              },
            ],
            type: config.TASK_TYPE.QUALIFYING_TEST,
          };
          taskData['status'] = config.TASK_STATUS.FINALISED;
          taskData.statusLog = {};
          taskData.statusLog[config.TASK_STATUS.FINALISED] = firebase.firestore.FieldValue.serverTimestamp();
          commands.push({
            command: 'set',
            ref: db.doc(`exercises/${params.exerciseId}/tasks/${config.TASK_TYPE.QUALIFYING_TEST}`),
            data: taskData,
          });
        }
      }
    }

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? commands.length : 0;

  }

};
