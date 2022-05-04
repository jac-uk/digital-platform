const { getDocument, getDocuments, applyUpdates, convertToDate, getEarliestDate, getLatestDate } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

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

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`));
    if (!exercise) return 0;

    // check if task already exists
    const task = await getDocument(db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`));
    if (task) {
      console.log('task already exists');
      return 0;
    }

    // get application records
    let queryRef = db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId)
      .where('stage', '==', params.stage);
    if (params.status) {
      queryRef = queryRef.where('status', '==', params.status);
    }
    const applicationRecords = await getDocuments(queryRef.select());

    // update application records
    const commands = [];
    applicationRecords.forEach(applicationRecord => {
      const data = {};
      data[`${params.type}.panelId`] = null;
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(applicationRecord.id),
        data: data,
      });
    });

    // create task
    const taskData = {
      _stats: {
        totalApplications: applicationRecords.length,
      },
      grades: config.GRADES,
      capabilities: exercise.capabilities,
      emptyScoreSheet: scoreSheet({ type: params.type, exercise: exercise }),
      startDate: taskStartDate({ type: params.type, exercise: exercise }),
      endDate: taskEndDate({ type: params.type, exercise: exercise }),
    };
    if (params.type === config.TASK_TYPE.SELECTION) {
      taskData['selectionCategories'] = exercise.selectionCategories;
    }
    taskData['status'] = config.TASK_STATUS.INITIALISED;
    taskData[`statusLog.${config.TASK_STATUS.INITIALISED}`] = firebase.firestore.FieldValue.serverTimestamp();
    commands.push({
      command: 'set',
      ref: db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`),
      data: taskData,
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applicationRecords.length : 0;
  }

  function scoreSheet({ type, exercise }) {
    let scoreSheet = {};
    switch (type) {
      case config.TASK_TYPE.SIFT:
        scoreSheet = exercise.capabilities.reduce((acc, curr) => (acc[curr] = '', acc), {});
        break;
      case config.TASK_TYPE.SELECTION:
        exercise.selectionCategories.forEach(category => {
          scoreSheet[category] = exercise.capabilities.reduce((acc, curr) => (acc[curr] = '', acc), {});
        });
        break;
      case config.TASK_TYPE.SCENARIO:
        // TODO scenario
        scoreSheet = exercise.capabilities.reduce((acc, curr) => (acc[curr] = '', acc), {});
        break;
    }
    return scoreSheet;
  }

  function taskStartDate({ type, exercise }) {
    switch (type) {
      case config.TASK_TYPE.SIFT:
        if (exercise.shortlistingMethods.indexOf('name-blind-paper-sift') >= 0 && exercise.nameBlindSiftStartDate) {
          return exercise.nameBlindSiftStartDate;
        } else {
          return exercise.siftStartDate;
        }
      case config.TASK_TYPE.SELECTION:
        return getEarliestDate(exercise.selectionDays.map(selectionDay => convertToDate(selectionDay.selectionDayStart)));
        // TODO scenario
    }
    return null;
  }

  function taskEndDate({ type, exercise }) {
    switch (type) {
      case config.TASK_TYPE.SIFT:
        if (exercise.shortlistingMethods.indexOf('name-blind-paper-sift') >= 0 && exercise.nameBlindSiftEndDate) {
          return exercise.nameBlindSiftEndDate;
        } else {
          return exercise.siftEndDate;
        }
      case config.TASK_TYPE.SELECTION:
        return getLatestDate(exercise.selectionDays.map(selectionDay => convertToDate(selectionDay.selectionDayEnd)));
        // TODO scenario
    }
    return null;
  }

};
