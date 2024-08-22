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

// Panel with applications on develop
const panelId = 'eN1iZih36ePXfqYcvqt1';
// exerciseId = 'wdpALbyICL7ZxxN5AQt8';
// applicationIds: ['9dQV6YKbgibVF6zlcGqe', 'AzQNMOymDcUs0LjM7mlB'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {

  const filename = 'GENERATED-SPREADSHEET-20.xlsx';

  const localFilePath = path.join(__dirname, filename);
  const googleDriveFolderName = 'TEST EXPORT GRADING SHEET';
  const columns = [
    { ref: 'PQE', type: 'grade' },
    { ref: 'Welsh questions', type: 'level' },
    { ref: 'YN types', type: 'yesno' },
    { ref: 'PF types', type: 'passfail' },
  ];
  const typeOptions = {
    grade: ['A', 'B', 'C', 'D'],
    yesno: ['Yes', 'No'],
    passfail: ['Pass', 'Fail'],
    level: ['None', 'Basic', 'Medium', 'High'],
  };
  
  let applicationIds = [];

  try {
    const panel = await getDocument(db.collection('panels').doc(panelId));
    if (panel.applicationsMap) {
      applicationIds = Object.keys(panel.applicationsMap);

      console.log('applicationIds:');
      console.log(applicationIds);
    
      // Create the worksheet with columns and validation and store it in a local file
      await createLocalWorksheetFile(columns, typeOptions, localFilePath, applicationIds);

      // Initialize Google Drive folder
      const folderId = await initialiseGoogleDriveFolder(googleDriveFolderName);

      // Copy local file into Google Drive folder
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

const createLocalWorksheetFile = async (columns, typeOptions, filePath, applicationIds) => {
  try {
    // INITIALIZE WORKBOOK AND WORKSHEET
    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Sheet1');

    // Define the columns, including the first column for Application ID
    worksheet.columns = [
      { header: 'Application ID', key: 'applicationId', width: 20 },
      ...columns.map(item => ({
        header: item.ref,
        width: 16,
      }))
    ];

    // Apply styles to the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Freeze the first row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Populate the Application ID column
    applicationIds.forEach((applicationId) => {
      worksheet.addRow({
        applicationId: applicationId
      });
    });

    // Add validation to the other columns, only for rows that were added from `applicationIds`
    worksheet = addValidationColumnsToWorksheet(worksheet, columns, typeOptions, applicationIds);

    // WRITE CONTENT TO FILE
    const data = await workbook.xlsx.writeBuffer();
    await fs_promise.writeFile(filePath, data);
    console.log(`Excel worksheet created and file saved locally at ${filePath}`);
  } catch (err) {
    console.log('ERROR:');
    console.log(`Unable to create excel worksheet locally at ${filePath}`);
    console.log(err);
  }
};

const addValidationColumnsToWorksheet = (worksheet, columns, typeOptions, applicationIds) => {
  const rowCount = applicationIds.length + 1; // number of rows to apply validation to (including header)

  // console.log('COLUMNS:');
  // console.log(columns);
  // console.log(`columns.length: ${columns.length}`);

  for (let i = 1; i < columns.length + 1; i++) {
    const columnLetter = String.fromCharCode(i + 65);
    const column = columns[i - 1];
    const columnType = column.type;
    const columnTypeOptions = typeOptions[columnType];
    const strOptions = columnTypeOptions.join(',');

    // console.log('================================');
    // console.log(`i: ${i}`);
    // console.log(`columnLetter: ${columnLetter}`);
    // console.log('column:');
    // console.log(column);
    // console.log(`columnType: ${columnType}`);
    // console.log(`columnTypeOptions: ${columnTypeOptions}`);
    // console.log(`strOptions: ${strOptions}`);

    for (let j = 2; j <= rowCount; j++) { // only apply validation to existing rows
      const cellStr = `${columnLetter}${j}`;

      // console.log('------------');
      // console.log(`j: ${j}`);
      // console.log(`columnLetter: ${columnLetter}`);
      // console.log(`cellStr: ${cellStr}`);

      worksheet.getCell(cellStr).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"' + strOptions + '"'],
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
