const { getDocument, getDocuments, applyUpdates, convertToDate, getEarliestDate, getLatestDate } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const { scoreSheet, taskStartDate, taskEndDate } = require('./taskHelpers')(config);

  return initialiseTask;

  /**
  * initialiseTask
  * Initialises an exercise processing task - e.g. sift, selection, scenario
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type of task
  *   `stage` (required) exercise stage
  *   `status` (optional) exercise status
  */
  async function initialiseTask(params) {

    const commands = [];

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`));
    if (!exercise) return 0;

    // check if task already exists
    const task = await getDocument(db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`));
    if (task) {
      console.log('task already exists');
      return 0;
    }

    // get next status
    let nextStatus;
    if ([config.TASK_TYPE.SIFT, config.TASK_TYPE.SELECTION].indexOf(params.type) >= 0) {
      nextStatus = config.TASK_STATUS.PANELS_INITIALISED;
    }
    if ([config.TASK_TYPE.CRITICAL_ANALYSIS, config.TASK_TYPE.SITUATIONAL_JUDGEMENT, config.TASK_TYPE.QUALIFYING_TEST, config.TASK_TYPE.SCENARIO].indexOf(params.type) >= 0) {
      nextStatus = config.TASK_STATUS.TEST_INITIALISED;
    }

    // get application records
    let queryRef = db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId);
    if (Object.keys(params).includes('stage')) {
      queryRef = queryRef.where('stage', '==', params.stage);
    }
    if (Object.keys(params).includes('status')) {
      queryRef = queryRef.where('status', '==', params.status);
    }
    const applicationRecords = await getDocuments(queryRef.select());
    if (applicationRecords.length === 0) {
      console.log('no applications found');
      return 0;
    }

    // construct task document, based on next status
    const taskData = {
      _stats: {
        totalApplications: applicationRecords.length,
      },
      startDate: taskStartDate({ type: params.type, exercise: exercise }),
      endDate: taskEndDate({ type: params.type, exercise: exercise }),
      type: params.type,
    };
    taskData.applicationStatus = params.status || '';
    taskData.status = nextStatus;
    taskData.statusLog = {};
    taskData.statusLog[nextStatus] = firebase.firestore.FieldValue.serverTimestamp();
    if (nextStatus === config.TASK_STATUS.PANELS_INITIALISED) {
      taskData.grades = config.GRADES;
      taskData.capabilities = exercise.capabilities;
      taskData.emptyScoreSheet = scoreSheet({ type: params.type, exercise: exercise });
      if (params.type === config.TASK_TYPE.SELECTION) {
        taskData.selectionCategories = exercise.selectionCategories;
      }
      // update application records with placeholder for panelId
      applicationRecords.forEach(applicationRecord => {
        const data = {};
        data[`${params.type}.panelId`] = null;
        commands.push({
          command: 'update',
          ref: db.collection('applicationRecords').doc(applicationRecord.id),
          data: data,
        });
      });
    }
    if (nextStatus === config.TASK_STATUS.TEST_INITIALISED) {
      // initialise test on QT Platform
      const qts = require('../../shared/qts')(config);
      const response = await qts.post('qualifying-test', {
        folder: exercise.referenceNumber,
        test: {
          type: params.type,
          startDate: taskData.startDate,
          endDate: taskData.endDate,
        },
      });
      taskData.folderId = response.folderId;
      taskData.test = {
        id: response.testId,
      };
    }
    commands.push({
      command: 'set',
      ref: db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`),
      data: taskData,
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applicationRecords.length : 0;
  }

};
