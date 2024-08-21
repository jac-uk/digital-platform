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

  const filename = 'GENERATED-SPREADSHEET-15.xlsx';

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
    level: [' None', 'Basic', 'Medium', 'High'],
  };
  const apps = [
    { applicationRef: 'abc123', candidate: 'Jane Smith' },
    { applicationRef: 'abc456', candidate: 'John Doe' }
  ];

  try {

    // Create the worksheet with columns and validation and store it in a local file
    await createLocalWorksheetFile(columns, typeOptions, localFilePath, apps);

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

const createLocalWorksheetFile = async (columns, typeOptions, filePath, apps) => {
  try {
    // INITIALIZE WORKBOOK AND WORKSHEET
    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Sheet1');

    // Define the columns, including the first two columns for Application Ref and Candidate
    worksheet.columns = [
      { header: 'Application Ref', key: 'applicationRef', width: 20 },
      { header: 'Candidate', key: 'candidate', width: 30 },
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

    // Populate the Application Ref and Candidate columns
    apps.forEach((app) => {
      worksheet.addRow({
        applicationRef: app.applicationRef,
        candidate: app.candidate
      });
    });

    // Add validation to the other columns, only for rows that were added from `apps`
    worksheet = addValidationColumnsToWorksheet(worksheet, columns, typeOptions, apps);

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

const addValidationColumnsToWorksheet = (worksheet, columns, typeOptions, apps) => {
  const rowCount = apps.length + 1; // number of rows to apply validation to (including header)
  for (let i = 2; i < columns.length + 2; i++) {
    const columnLetter = String.fromCharCode(i + 65);
    const column = columns[i - 2];
    const columnType = column.type;
    const columnTypeOptions = typeOptions[columnType];
    const strOptions = columnTypeOptions.join(',');

    for (let j = 2; j <= rowCount; j++) { // only apply validation to existing rows
      const cellStr = `${columnLetter}${j}`;
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
