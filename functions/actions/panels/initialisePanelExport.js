import { getDocument, getDocuments } from '../../shared/helpers.js';
import initDrive from '../../shared/google-drive.js';
import { exportGradingSheet } from './exportGradingSheet.js';
//import lookup from '../../shared/converters/lookup.js';

const drive = initDrive();

export default (firebase, db) => {

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
    //const settings = await getDocument(db.collection('settings').doc('services'));

    // get exercise
    const exerciseId = panel.exercise ? panel.exercise.id : panel.exerciseId;
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    // get google drive name
    const driveName = exercise.referenceNumber;

    // get panel and type folder name
    const panelFolderName = panel.name;
    //const panelTypeFolderName = lookup(panel.type) || panel.type;

    // login to google drive and create panel folder
    await drive.login();

    // check if drive exists
    const drives = await drive.listSharedDrives(driveName);
    if (!drives.length) {
      console.error('Folder not found:', driveName);
      const data = {
        status: 'draft',
        error: 'Folder not found - please rename root exercise folder according to the reference number of the exercise, i.e. JAC00XXX',
      };
      await panel.ref.update(data);
      return false;
    }
    const driveId = drives[0].id;
    drive.setDriveId(driveId);
    
    // create panel folder and get id
    const panelFolderId = await drive.createFolder(panelFolderName, {
      parentId: driveId,
    });
    console.log('panelFolderId', panelFolderId);

    // Create grading spreadsheet
    await exportGradingSheet(drive, panelFolderId, panelFolderName, panel).catch(e => 'Error: Grading Sheet');

    // update panel and start processing
    const applicationIds = Object.keys(applicationsMap);
    const data = {
      drive: {
        driveId: driveId,
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
      error: '',
    };
    await panel.ref.update(data);

    return true;

  }

};
