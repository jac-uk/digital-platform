/**
 * A test file to use whilst building some functionality. It can be deleted once built.
 * It does the following:
 * 
 * Creates a spreadsheet for grading sheets with dropdowns in cells to limit the type of data that can be specified
 * Saves the spreadsheet locally
 * Creates a folder on Google Drive
 * Copies the spreadsheet to Google Drive
 * Deletes the local file
 * 
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript testCreateGradingSheet
 *   ```
 */

import { app, db } from './shared/admin.js';
import { getDocument } from '../functions/shared/helpers.js';
import initDrive from '../functions/shared/google-drive.js';
const drive = initDrive();

import { exportGradingSheet } from '../functions/actions/panels/exportGradingSheet.js';

// Panel with applications on develop
const panelId = 'U9Qrw1eMpXtMBw1k02lb';
// exerciseId = 'wdpALbyICL7ZxxN5AQt8';
// applicationIds: ['9dQV6YKbgibVF6zlcGqe', 'AzQNMOymDcUs0LjM7mlB'];

const main = async () => {

  const googleDriveFolderName = '0000 WS test';
  
  try {
    const panel = await getDocument(db.collection('panels').doc(panelId));
    const folderId = await initialiseGoogleDriveFolder(googleDriveFolderName);

    await exportGradingSheet(drive, folderId, googleDriveFolderName, panel);

  }
  catch (err) {
    console.log('ERROR:');
    console.log(err);
  }
};

const initialiseGoogleDriveFolder = async (folderName = 'Test Grading Sheet') => {
  await drive.login();
  const settings = await getDocument(db.collection('settings').doc('services'));
  drive.setDriveId(settings.google.driveId);

  const folders = await drive.listFolders();
  let folderId = 0;
  folders.forEach((v) => {
    if (v.name === folderName) {
      folderId = v.id;
    }
  });

  if (folderId === 0) { 
    folderId = await drive.createFolder(folderName);
  }

  return folderId;
};

main()
  .then((result) => {
    console.log('Result', result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
