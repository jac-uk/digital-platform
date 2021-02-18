const { getDocument, getDocuments, applyUpdates, getAllDocuments, formatDate } = require('../../shared/helpers');
const drive = require('../../shared/google-drive')();

module.exports = (config, firebase, db) => {

  return {
    initialisePanelExport,
  };

  /**
  * initialisePanelExport
  *
  * @param {*} `panelId` (required) ID of panel to export
  */
  async function initialisePanelExport(panelId) {

    console.log('initialisePanelExport', panelId);

    // get panel
    // TODO we can pass in panel data so don't need to get it
    const panel = await getDocument(db.collection('panels').doc(panelId));
    if (panel.status !== 'approved') {
      return false;
    }

    // get exercise
    // TODO store `panel.exercise.referenceNumber` instead of getting exercise
    const exercise = await getDocument(db.collection('exercises').doc(panel.exerciseId));

    // get application ids
    const applicationRecords = await getDocuments(
      db.collection('applicationRecords')
      .where(`panelIds.${panel.type}`, '==', panel.id)
      .select()
    );
    if (!applicationRecords.length) {
      return false;
    }

    // populate applicationsMap
    const applicationsMap = {};
    applicationRecords.forEach(applicationRecord => {
      applicationsMap[applicationRecord.id] = {
        folderId: '',
        fileIds: [],
      };
    });

    // get settings
    const settings = await getDocument(db.collection('settings').doc('services'));

    // get exercise ref number and make a folder name
    const folderName =
      (exercise.referenceNumber).slice(3) + ' ' + panel.name;

    // login to google drive and create panel folder
    await drive.login();
    drive.setDriveId(settings.google.driveId);
    const panelFolderId = await drive.createFolder(folderName, {
      parentId: settings.google.rootFolderId,
    });

    // update panel and start processing
    const applicationIds = Object.keys(applicationsMap);
    const data = {
      drive: {
        driveId: settings.google.driveId,
        folderId: panelFolderId,
      },
      applicationsMap: applicationsMap,
      status: 'processing',
      'statusLog.processing': firebase.firestore.FieldValue.serverTimestamp(),
      processing: {
        current: applicationIds.shift(),   // start processing first application
        queue: applicationIds,
        errors: [],
      },
    };
    await panel.ref.update(data);

    return true;

  }

};
