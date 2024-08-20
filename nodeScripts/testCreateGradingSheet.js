
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
 *   npm run testCreateGradingSheet
 *   ```
 */

'use strict';

import { app, db } from './shared/admin.js';
import path from 'path';
import ExcelJS from 'exceljs';
import { getDocument } from '../functions/shared/helpers.js';
import initDrive from '../functions/shared/google-drive.js';
const drive = initDrive();

import fs from 'fs';
const fs_promise = fs.promises;

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {

  const filename = 'GENERATED-SPREADSHEET-12.xlsx';
  const localFilePath = path.join(__dirname, filename);
  const googleDriveFolderName = 'TEST EXPORT GRADING SHEET';
  const columns = [
    { ref: 'PQE', type: 'grade' },
    { ref: 'Welsh questions', type: 'level' },
    { ref: 'YN types', type: 'yesno' },
    { ref: 'PF types', type: 'passfail' },
  ];
  const typeOptions = {
    grade: ['A','B','C','D'],
    yesno: ['Yes', 'No'],
    passfail: ['Pass', 'Fail'],
    level: [' None', 'Basic', 'Medium', 'High'],
  };

  try {

    // Create the worksheet with columns and validation and store it in a local file
    createLocalWorksheetFile(columns, typeOptions, localFilePath);

    // Intialise google drive folder
    const folderId = await initialiseGoogleDriveFolder(googleDriveFolderName);

    // Copy local file into google drive folder
    await drive.createFile(filename, {
      folderId,
      sourceType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sourceContent: fs.createReadStream(path.resolve('nodeScripts', filename)),
      destinationType: 'application/vnd.google-apps.spreadsheet',
    });

    console.log(`Local file copied into drive folder: ${googleDriveFolderName}`);

    // Delete local file
    await fs_promise.unlink(localFilePath);

    console.log(`Local file deleted from path: ${localFilePath}`);
  }
  catch (err) {
    console.log('ERROR:');
    console.log(err);
  }
};

/**
   * Initialise the Google Drive service and return the folder ID for the specified folder
   * 
   * @param   {string} folderName 
   * @returns {string} The folder ID
   */
const initialiseGoogleDriveFolder = async(folderName = 'Test Grading Sheet') => {
  // get drive service
  await drive.login();

  // get settings and apply them
  const settings = await getDocument(db.collection('settings').doc('services'));
  drive.setDriveId(settings.google.driveId);

  // make sure a destination folder exists to create the file in
  const folders = await drive.listFolders();
  let folderId = 0;
  folders.forEach((v, i) => {
    if (v.name === folderName) {
      folderId = v.id;
    }
  });
  if (folderId === 0) { // folder doesn't exist so create it
    folderId = await drive.createFolder(folderName);
  }

  return folderId;
};

/**
 * Create the spreadsheet and save it locally
 * @param {*} filename 
 */
const createLocalWorksheetFile = async (columns, typeOptions, filePath) => {
  try {
    // INITIALISE WORKBOOK AND WORKSHEET
    const workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Sheet1');
    
    // ADD HEADER COLUMNS TO WORKSHEET
    worksheet.columns = columns.map(item => {
      return {
        // Can optionally specify a 'key' and 'width' below, eg width: 32
        header: item.ref,
        width: 16,
      };
    });

    // ADD VALIDATION TO COLUMNS
    worksheet = addValidationColumnsToWorksheet(worksheet, columns, typeOptions);

    // WRITE CONTENT TO FILE
    const data = await workbook.xlsx.writeBuffer();
    await fs_promise.writeFile(filePath, data);
    console.log(`Excel worksheet created and file saved locally at ${filePath}`);

  }
  catch (err) {
    console.log('ERROR:');
    console.log(`Unable to create excel worksheet locally at ${filePath}`);
    console.log(err);
  }
};

/**
 * Add Validation columns to the worksheet
 * @param {*} worksheet 
 * @param {*} columns 
 * @param {*} typeOptions 
 * @returns 
 */
const addValidationColumnsToWorksheet = (worksheet, columns, typeOptions) => {
  for (let i=0; i<columns.length; ++i) {
    const columnLetter = String.fromCharCode(i + 65);
    const column = columns[i];
    const columnType = column.type;
    const columnTypeOptions = typeOptions[columnType];
    const strOptions = columnTypeOptions.join(',');
    for (let i = 2; i < 1000; i++) {
      const cellStr = `${columnLetter}${i}`;
      worksheet.getCell(cellStr).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"'+strOptions+'"'],
      };
    }
  }

  return worksheet;
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
