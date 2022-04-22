const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return activateTask;

  /**
  * activateTask
  * Activates an exercise processing task - e.g. sift, selection, scenario
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type of task
  *   `grades` (optional) override the default grades
  */
  async function activateTask(params) {

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`));
    if (!exercise) return 0;

    // get application records
    const queryRef = db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId)
      .where('active', '==', true)
      .where(`${params.type}.panelId`, '!=', '');  // ensure we only fetch applications which are part of current task
    const applicationRecords = await getDocuments(queryRef.select());  //`${params.type}.panelId`, 'application.referenceNumber'));

    // panels
    const panels = await getDocuments(
      db.collection('panels')
      .where('exercise.id', '==', params.exerciseId)
      .where('type', '==', params.type)
      .select()
    );

    // relevant panellists
    const panellistIds = [].concat(panels.map(panel => panel.panellistIds));
    console.log('panellistIds', panellistIds);

    // update panels
    const commands = [];
    panels.forEach(panel => {
      const data = {
        applicationIds: applicationRecords.map(application => application.id),
        applications: {},
        panellists: {},
        capabilities: exercise.capabilities,
        grades: params.grades ? params.grades : config.GRADES,
        scoreSheet: {},
        status: config.PANEL_STATUS.CREATED,
      };
      applicationRecords.forEach(applicationRecord => {
        data.applications[applicationRecord.id] = {
          referenceNumber: applicationRecord.application.referenceNumber,
          // TODO include fullName for non name-blind
        };
        // data.scoreSheet[applicationRecord.id] = emptyScoreSheet({ type: panel.type, capabilities: exercise.capabilities }).scoreSheet;
      });
      // panellists.filter(panellist => this.panel.panellistIds.indexOf(panellist.id) >= 0).forEach(panellist => {
      //   data.panellists[panellist.id] = {
      //     fullName: panellist.fullName,
      //     // TODO include other details e.g. phone, email?
      //   };
      // });
      commands.push({
        command: 'update',
        ref: db.collection('panels').doc(panel.id),
        data: data,
      });
    });

    // // write to db
    // const result = await applyUpdates(db, commands);
    // return result ? applicationRecords.length : 0;

  }

};
