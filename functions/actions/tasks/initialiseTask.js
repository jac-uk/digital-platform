const { object } = require('firebase-functions/lib/providers/storage');
const { getDocument, getDocuments, applyUpdates, convertToDate, getEarliestDate, getLatestDate } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const { scoreSheet, getTimelineTasks, taskStartDate, taskEndDate, createMarkingScheme, taskNextStatus, taskApplicationsEntryStatus } = require('./taskHelpers')(config);

  return initialiseTask;

  /**
  * initialiseTask
  * Initialises an exercise processing task - e.g. sift, selection, scenario
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type of task
  */
  async function initialiseTask(params) {

    const commands = [];

    // get exercise
    let exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`), true);
    if (!exercise) return 0;

    // check if task already exists
    const task = await getDocument(db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`));
    if (task) {
      console.log('task already exists');
      return 0;
    }

    // get next status
    let nextStatus = taskNextStatus(params.type);

    // get status for eligibile applications
    const applicationEntryStatus = taskApplicationsEntryStatus(exercise, params.type);

    // get application records
    let queryRef = db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId);
    if (applicationEntryStatus) {
      queryRef = queryRef.where('status', '==', applicationEntryStatus);
    }
    const applicationRecords = await getDocuments(queryRef.select());
    if (applicationRecords.length === 0) {
      console.log('no applications found');
      return 0;
    }

    // get timeline task
    const timelineTask = getTimelineTasks(exercise, params.type)[0];

    // construct task document, based on next status
    const taskData = {
      _stats: {
        totalApplications: applicationRecords.length,
      },
      startDate: timelineTask.date,
      endDate: timelineTask.endDate ? timelineTask.endDate : timelineTask.date,
      dateString: timelineTask.dateString,
      type: params.type,
    };
    taskData.applicationEntryStatus = applicationEntryStatus;
    taskData.status = nextStatus;
    taskData.statusLog = {};
    taskData.statusLog[nextStatus] = firebase.firestore.FieldValue.serverTimestamp();
    if (nextStatus === config.TASK_STATUS.PANELS_INITIALISED) {
      Object.assign(taskData, await initialisePanelTask(exercise, params.type, applicationRecords));
    }
    if (nextStatus === config.TASK_STATUS.TEST_INITIALISED) {
      Object.assign(taskData, await initialiseTestTask(exercise.referenceNumber, params.type, taskData.startDate, taskData.endDate));
    }
    if (nextStatus === config.TASK_STATUS.DATA_INITIALISED) {
      Object.assign(taskData, await initialiseDataTask(exercise, params.type));
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

  /**
   * Initialises a panel task and returns data to be stored in the `task` document
   * @param {*} exercise
   * @param {*} taskType
   * @param {*} applicationRecords
   */
  async function initialisePanelTask(exercise, taskType, applicationRecords) {
    const taskData = {};
    taskData.grades = config.GRADES;
    taskData.markingScheme = createMarkingScheme(exercise, taskType);
    taskData.emptyScoreSheet = scoreSheet({ type: taskType, exercise: exercise });
    // update application records with placeholder for panelId
    const commands = [];
    applicationRecords.forEach(applicationRecord => {
      const data = {};
      data[`${taskType}.panelId`] = null;
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(applicationRecord.id),
        data: data,
      });
    });
    await applyUpdates(db, commands);
    return taskData;
  }

  /**
   * Initialises a test and returns data to be stored in the `task` document
   * @param {*} folderName
   * @param {*} testType
   * @param {*} startDate
   * @param {*} endDate
   */
  async function initialiseTestTask(folderName, testType, startDate, endDate) {
    const taskData = {};
    // initialise test on QT Platform
    const qts = require('../../shared/qts')(config);
    const response = await qts.post('qualifying-test', {
      folder: folderName,
      test: {
        type: testType,
        startDate: startDate,
        endDate: endDate,
      },
    });
    taskData.folderId = response.folderId;
    taskData.test = {
      id: response.testId,
    };
    return taskData;
  }

};
