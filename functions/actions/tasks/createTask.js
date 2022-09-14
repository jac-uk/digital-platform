const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const { getTimelineTasks, taskNextStatus, taskApplicationsEntryStatus } = require('./taskHelpers')(config);
  const { initialisePanelTask, initialiseTestTask, initialiseStatusChangesTask } = require('./updateTask')(config, firebase, db);

  return createTask;

  /**
  * createTask
  * Creates an exercise processing task - e.g. sift, selection, scenario
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type of task
  */
  async function createTask(params) {

    console.log('createTask', params);

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`), true);
    if (!exercise) return 0;

    // check if task already exists
    const task = await getDocument(db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`));
    if (task) {
      console.log('task already exists');
      return 0;
    }

    // get next status
    let nextStatus = taskNextStatus(params.type);
    console.log('nextStatus', nextStatus);

    // get status for eligibile applications
    const applicationEntryStatus = taskApplicationsEntryStatus(exercise, params.type);
    console.log('applicationEntryStatus', applicationEntryStatus);

    // get application records
    let queryRef = db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId);
    if (applicationEntryStatus) {
      queryRef = queryRef.where('status', '==', applicationEntryStatus);
    }
    const applicationRecords = await getDocuments(queryRef.select('application', 'candidate'));
    if (applicationRecords.length === 0) {
      console.log('no applications found');
      return 0;
    }

    // get task data from timeline
    const timelineTask = getTimelineTasks(exercise, params.type)[0];

    // construct task document, based on next status
    let result;
    switch (nextStatus) {
    case config.TASK_STATUS.PANELS_INITIALISED:
      result = await initialisePanelTask(exercise, params.type, applicationRecords);
      break;
    case config.TASK_STATUS.TEST_INITIALISED:
      result = await initialiseTestTask(exercise.referenceNumber, params.type, timelineTask.date, timelineTask.endDate);
      break;
    case config.TASK_STATUS.STATUS_CHANGES:
      result = await initialiseStatusChangesTask(exercise, params.type, applicationRecords);
      break;
    case config.TASK_STATUS.DATA_INITIALISED:
      result = await initialiseDataTask(exercise, params.type);
      break;
    }
    if (result) {
      if (result.success) {
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
        Object.assign(taskData, result.data);
        const commands = [];
        commands.push({
          command: 'set',
          ref: db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`),
          data: taskData,
        });
        await applyUpdates(db, commands);
        return applicationRecords.length;
      }
    }
  }

};
