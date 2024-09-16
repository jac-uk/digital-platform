import ExcelJS from 'exceljs';
import fs from 'fs';
import { getTempLocalFilePath, writeToLocalFile, deleteLocalFile } from '../../shared/file.js';
import { MARKING_TYPE, markingScheme2Columns, markingTypeHasOptions, markingTypeGetOptions } from '../../shared/scoreSheetHelper.js';

export {
  exportGradingSheet,
};

/**
 * Creates a spreadsheet for grading sheets with dropdowns in cells to limit the type of data that can be specified
 * Builds a row per application
 * Saves the spreadsheet locally
 * Copies the spreadsheet to Google Drive
 * Deletes the local file
 * @param {*} drive 
 * @param {*} folderId 
 * @param {*} folderName
 * @param {*} panel 
 */
async function exportGradingSheet(drive, folderId, folderName, panel) {
  const tempFilePath = getTempLocalFilePath('grading-sheet');
  const filename = `${folderName}.grading-sheet.xlsx`;
  const columns = markingScheme2Columns(panel.markingScheme);
  
  let referenceNumbers = [];
  if (panel.applicationIds && panel.applications) {
    referenceNumbers = panel.applicationIds.map(applicationId => panel.applications[applicationId].referenceNumber);

    // Create the workbook + worksheet with columns and validation and store it in a local file
    const workbook = await createWorkbook(columns, referenceNumbers);

    // Write content to temp local file
    const data = await workbook.xlsx.writeBuffer();
    await writeToLocalFile(tempFilePath, data);

    // Copy local file into Google Drive folder
    await drive.createFile(filename, {
      folderId,
      sourceType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sourceContent: fs.createReadStream(tempFilePath),
      destinationType: 'application/vnd.google-apps.spreadsheet',
    });

    // Delete local file
    deleteLocalFile(tempFilePath);
  }
}

/**
 * Create the excel workbook and worksheet
 * Style and freeze the header row
 * Add the columns of Application ID marking scheme and populate its rows with data/dropdowns
 * @param {*} columns 
 * @param {*} referenceNumbers 
 * @returns 
 */
async function createWorkbook(columns, referenceNumbers) {
  // Initialise workbook and worksheet
  let workbook = new ExcelJS.Workbook();
  let worksheet = workbook.addWorksheet('Sheet1');

  // Define the columns, including the first column for Application/Reference
  worksheet.columns = [
    { header: 'Application', key: 'referenceNumber', width: 20 },
    ...columns.map(item => ({
      header: item.title,
      width: 16,
    })),
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
  referenceNumbers.forEach((referenceNumber) => {
    worksheet.addRow({
      referenceNumber: referenceNumber,
    });
  });

  // Add validation to the other columns, only for rows that were added from `referenceNumbers`
  worksheet = addValidationColumnsToWorksheet(worksheet, columns, referenceNumbers);
  return workbook;
}

/**
 * Add dropdown columns with fixed options
 * @param {*} worksheet 
 * @param {*} columns 
 * @param {*} referenceNumbers 
 * @returns 
 */
function addValidationColumnsToWorksheet(worksheet, columns, referenceNumbers) {
  const rowCount = referenceNumbers.length + 1; // number of rows to apply validation to (including header)
  for (let i = 1; i < columns.length + 1; i++) {
    const columnLetter = String.fromCharCode(i + 65);
    const column = columns[i - 1];
    const columnType = column.type;
    if (markingTypeHasOptions(columnType)) {
      const columnTypeOptions = markingTypeGetOptions(columnType);
      const strOptions = columnTypeOptions.map(option => option.value).join(',');
      for (let j = 2; j <= rowCount; j++) { // only apply validation to existing rows
        const cellStr = `${columnLetter}${j}`;
        worksheet.getCell(cellStr).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"' + strOptions + '"'],
        };
      }  
    } else if (columnType === MARKING_TYPE.NUMBER.value) {
      console.log('add Number validation');
      for (let j = 2; j <= rowCount; j++) { // only apply validation to existing rows
        const cellStr = `${columnLetter}${j}`;
        worksheet.getCell(cellStr).dataValidation = {
          type: 'whole',
          allowBlank: false,
        };
      }  
    }
  }
  return worksheet;
}
