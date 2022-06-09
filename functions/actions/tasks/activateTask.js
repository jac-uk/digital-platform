const { getDocument, getDocuments, getDocumentsFromQueries, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return activateTask;

  /**
  * activateTask
  * Activates an exercise processing task - e.g. sift, selection, scenario
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type of task
  */
  async function activateTask(params) {

    // get task
    const taskRef = db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`);
    const task = await getDocument(taskRef);
    if (!task) return 0;
    if (task.status !== config.TASK_STATUS.INITIALISED) return 0;

    // panels
    const panels = await getDocuments(
      db.collection('panels')
      .where('exercise.id', '==', params.exerciseId)
      .where('type', '==', params.type)
      .where('applicationIds', '!=', '')
      .select('panellistIds', 'applicationIds')
    );
    const panelIds = panels.map(panel => panel.id);

    // relevant panellists
    let panellists = [];
    const panellistIds = [].concat(...panels.map(panel => panel.panellistIds || []));
    if (panellistIds.length) {
      const queries = panellistIds.map(panellistId => {
        return db
          .collection('panellists')
          .where(firebase.firestore.FieldPath.documentId(), '==', panellistId)
          .select('fullName');
      });
      panellists = await getDocumentsFromQueries(queries);
    }

    // relevant application records
    let applicationRecords = [];
    const applicationIds = [].concat(...panels.map(panel => panel.applicationIds || []));
    if (applicationIds.length) {
      applicationRecords = await getDocumentsFromQueries(
        applicationIds.map(applicationId => {
          return db
            .collection('applicationRecords')
            .where(firebase.firestore.FieldPath.documentId(), '==', applicationId)
            .select('application');
        })
      );
    }

    // update panels
    const commands = [];
    panels.forEach(panel => {
      const data = {
        applications: {},
        panellists: {},
        capabilities: task.capabilities,
        grades: task.grades,
        scoreSheet: {},
        status: config.PANEL_STATUS.CREATED,
      };
      data[`statusLog.${config.PANEL_STATUS.CREATED}`] = firebase.firestore.FieldValue.serverTimestamp();

      if (params.type === config.TASK_TYPE.SELECTION) {
        data['selectionCategories'] = task.selectionCategories;
      }

      const relevantApplicationRecords = applicationRecords.filter(applicationRecord => panel.applicationIds.indexOf(applicationRecord.id) >= 0);
      relevantApplicationRecords.forEach(applicationRecord => {
        data.applications[applicationRecord.id] = {
          referenceNumber: applicationRecord.application.referenceNumber,
          // TODO include fullName for non name-blind
        };
        data.scoreSheet[applicationRecord.id] = task.emptyScoreSheet;
      });

      const relevantPanellists = panellists.filter(panellist => panel.panellistIds.indexOf(panellist.id) >= 0);
      relevantPanellists.forEach(panellist => {
        data.panellists[panellist.id] = {
          fullName: panellist.fullName,
          // TODO include other details e.g. phone, email?
        };
      });

      commands.push({
        command: 'update',
        ref: db.collection('panels').doc(panel.id),
        data: data,
      });
    });

    // update task
    const taskData = {};
    taskData.panelIds = panelIds;
    taskData['status'] = config.TASK_STATUS.ACTIVATED;
    taskData[`statusLog.${config.TASK_STATUS.ACTIVATED}`] = firebase.firestore.FieldValue.serverTimestamp();
    commands.push({
      command: 'update',
      ref: taskRef,
      data: taskData,
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applicationRecords.length : 0;

  }

};
