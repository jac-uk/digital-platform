const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const { getTimelineTasks, getEmptyScoreSheet, scoreSheet2MarkingScheme } = require('./taskHelpers')(config);

  return createTaskForExistingQT;

  /**
  * createTask
  * Creates an exercise processing task - e.g. sift, selection, scenario
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type of task
  */
  async function createTaskForExistingQT(params) {

    console.log('createTaskForExistingQT', params);

    let result = {
      success: false,
      data: {},
    };

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`), true);
    if (!exercise) return result;

    // check if task already exists
    const task = await getDocument(db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`));
    if (task) {
      console.log('task already exists');
      return result;
    }

    // get QT
    const qualifyingTest = await getDocument(db.doc(`qualifyingTests/${params.qualifyingTestId}`));
    if (!qualifyingTest) return result;

    // get QT responses
    const qualifyingTestResponses = await getDocuments(
      db.collection('qualifyingTestResponses')
      .where('vacancy.id', '==', exercise.id)
      .where('qualifyingTest.id', '==', qualifyingTest.id)
      .select('application', 'candidate', 'score')
    );
    if (!qualifyingTestResponses || qualifyingTestResponses.length <= 0) return result;

    // get task data from timeline
    const timelineTask = getTimelineTasks(exercise, params.type)[0];

    // construct applications data and final scores
    const applications = [];
    const finalScores = [];
    qualifyingTestResponses.forEach(qualifyingTestResponse => {
      applications.push({
        id: qualifyingTestResponse.application.id,
        ref: qualifyingTestResponse.application.referenceNumber,
        fullName: qualifyingTestResponse.candidate.fullName,
        adjustments: qualifyingTestResponse.candidate.reasonableAdjustments,
      });
      finalScores.push({
        id: qualifyingTestResponse.application.id,
        ref: qualifyingTestResponse.application.referenceNumber,
        score: qualifyingTestResponse.score >= 0 ? qualifyingTestResponse.score : null,
      });
    });

    // populate task
    const taskData = {
      _stats: {
        totalApplications: qualifyingTestResponses.length,
      },
      startDate: timelineTask.date,
      endDate: timelineTask.endDate ? timelineTask.endDate : timelineTask.date,
      dateString: timelineTask.dateString,
      type: params.type,
      applications: applications,
      finalScores: finalScores,
      qualifyingTest: {
        id: qualifyingTest.id,
        questionIds: getQuestionIds(qualifyingTest),
      },
      maxScore: qualifyingTest.maxScore,
    };

    let nextStatus = config.TASK_STATUS.FINALISED;
    if (params.type === config.TASK_TYPE.SCENARIO) {
      nextStatus = config.TASK_STATUS.DATA_ACTIVATED;
      taskData.emptyScoreSheet = getEmptyScoreSheet(taskData.qualifyingTest.questionIds);
      taskData.markingScheme = scoreSheet2MarkingScheme(taskData.emptyScoreSheet);
      taskData.scoreSheet = {};
      taskData.applications.forEach(application => {
        taskData.scoreSheet[application.id] = taskData.emptyScoreSheet;
      });
    }
    // taskData.applicationEntryStatus = applicationEntryStatus;
    taskData.status = nextStatus;
    taskData.statusLog = {};
    taskData.statusLog[nextStatus] = firebase.firestore.FieldValue.serverTimestamp();
    const commands = [];
    commands.push({
      command: 'set',
      ref: db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`),
      data: taskData,
    });
    console.log('taskData', taskData);
    await applyUpdates(db, commands);
    return result;
  }

  function getQuestionIds(qualifyingTest) {
    const questionIds = [];
    if (!qualifyingTest) return questionIds;
    if (!qualifyingTest.testQuestions) return questionIds;
    if (!qualifyingTest.testQuestions.questions) return questionIds;
    if (qualifyingTest.type === config.QUALIFYING_TEST.TYPE.SCENARIO) {
      qualifyingTest.testQuestions.questions.forEach((s, sIndex) => {
        s.options.forEach((q, qIndex) => {
          questionIds.push(`S${1 + sIndex}.Q${1+qIndex}`);
        });
      });
    } else {
      qualifyingTest.testQuestions.questions.forEach((q, qIndex) => {
        questionIds.push(`Q${1+qIndex}`);
      });
    }
    return questionIds;
  }

};
