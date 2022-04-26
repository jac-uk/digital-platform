const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

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
      status: 'initialised',
      statusLog: {
        initialised: firebase.firestore.FieldValue.serverTimestamp(),
      },
      _stats: {
        totalApplications: applicationRecords.length,
      },
      grades: config.GRADES,
      capabilities: exercise.capabilities,
      scoreSheet: scoreSheet({ type: params.type, exercise: exercise })
    };
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
    if (type === config.TASK_TYPE.SIFT) {
      scoreSheet = exercise.capabilities.reduce((acc, curr) => (acc[curr] = '', acc), {});
    }
    // TODO selection & scenario
    return scoreSheet;
  }

};
