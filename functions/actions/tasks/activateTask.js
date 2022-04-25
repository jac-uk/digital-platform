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
    const task = await getDocument(db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`));
    if (!task) return 0;

    // panels
    const panels = await getDocuments(
      db.collection('panels')
      .where('exercise.id', '==', params.exerciseId)
      .where('type', '==', params.type)
      .select('panellistIds', 'applicationIds')
    );

    // relevant panellists
    let panellists = [];
    const panellistIds = [].concat(...panels.map(panel => panel.panellistIds || []));
    if (panellistIds.length) {
      const queries = panellistIds.map(panellistId => {
        // return db.doc(`panellists/${panellistId}`).select('fullName');
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
      if (!panel.applicationIds || !panel.panellistIds) return;
      const data = {
        applications: {},
        panellists: {},
        capabilities: task.capabilities,
        grades: task.grades,
        scoreSheet: {},
        status: config.PANEL_STATUS.CREATED,
      };
      data[`statusLog.${config.PANEL_STATUS.CREATED}`] = firebase.firestore.FieldValue.serverTimestamp();

      const relevantApplicationRecords = applicationRecords.filter(applicationRecord => panel.applicationIds.indexOf(applicationRecord.id) >= 0);
      relevantApplicationRecords.forEach(applicationRecord => {
        data.applications[applicationRecord.id] = {
          referenceNumber: applicationRecord.application.referenceNumber,
          // TODO include fullName for non name-blind
        };
        data.scoreSheet[applicationRecord.id] = task.scoreSheet;
      });

      const relevantPanellists = panellists.filter(panellist => panel.panellistIds.indexOf(panellist.id) >= 0)
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

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applicationRecords.length : 0;

  }

};
