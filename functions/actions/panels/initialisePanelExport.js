import { getDocument, getDocuments, applyUpdates, getAllDocuments, formatDate } from '../../shared/helpers.js';
import initDrive from '../../shared/google-drive.js';
import { exportGradingSheet } from './exportGradingSheet.js';

const drive = initDrive();

export default (config, firebase, db) => {

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

    // get application ids
    let applicationRecords = await getDocuments(
      db.collection('applicationRecords')
      .where(`${panel.type}.panelId`, '==', panel.id)
      .select()
    );
    if (!applicationRecords.length) { // maintain backwards compatibility
      applicationRecords = await getDocuments(
        db.collection('applicationRecords')
          .where(`panelIds.${panel.type}`, '==', panel.id)
          .select()
      );
    }
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

    // get exercise
    const exerciseId = panel.exercise ? panel.exercise.id : panel.exerciseId;
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    // get exercise ref number and make a folder name
    const folderName =
      (exercise.referenceNumber).slice(3) + ' ' + panel.name;

    // login to google drive and create panel folder
    await drive.login();

    drive.setDriveId(settings.google.driveId);
    const panelFolderId = await drive.createFolder(folderName, {
      parentId: settings.google.rootFolderId,
    });

    // Create grading spreadsheet 
    await exportGradingSheet(drive, panelFolderId, folderName, panel).catch(e => 'Error: Grading Sheet');

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
