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

  // TODO amend this so it handles activation of all task types/modules, not just panel tasks

    // get task
    const taskRef = db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`);
    const task = await getDocument(taskRef);
    if (!task) return 0;
    if (task.status !== config.TASK_STATUS.PANELS_INITIALISED) return 0;

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
        markingScheme: task.markingScheme,
        scoreSheet: {},
        status: config.PANEL_STATUS.CREATED,
      };
      if (task.grades) {
        data.grades = task.grades;
        data.grade_values = config.GRADE_VALUES;
      }
      data[`statusLog.${config.PANEL_STATUS.CREATED}`] = firebase.firestore.FieldValue.serverTimestamp();

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
    taskData['status'] = config.TASK_STATUS.PANELS_ACTIVATED;
    taskData[`statusLog.${config.TASK_STATUS.PANELS_ACTIVATED}`] = firebase.firestore.FieldValue.serverTimestamp();
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
