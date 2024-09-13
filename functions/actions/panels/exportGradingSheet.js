import exceljs from 'exceljs';
import fs from 'fs';
import { getTempLocalFilePath, writeToLocalFile, deleteLocalFile } from '../../shared/file.js';

export default () => {

  return {
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
   * @param {*} panel 
   */
  async function exportGradingSheet(drive, folderId, panel) {
    const tempFilePath = getTempLocalFilePath('grading-sheet');
    const filename = 'grading_sheet.xlsx';
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
    if (panel.applicationsMap) {
      applicationIds = Object.keys(panel.applicationsMap);

      // Create the workbook + worksheet with columns and validation and store it in a local file
      const workbook = await createWorkbook(columns, typeOptions, applicationIds);

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
   * @param {*} typeOptions 
   * @param {*} applicationIds 
   * @returns 
   */
  async function createWorkbook(columns, typeOptions, applicationIds) {
    // Initialise workbook and worksheet
    let workbook = new exceljs.Workbook();
    let worksheet = workbook.addWorksheet('Sheet1');

    // Define the columns, including the first column for Application ID
    worksheet.columns = [
      { header: 'Application ID', key: 'applicationId', width: 20 },
      ...columns.map(item => ({
        header: item.ref,
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
    applicationIds.forEach((applicationId) => {
      worksheet.addRow({
        applicationId: applicationId,
      });
    });

    // Add validation to the other columns, only for rows that were added from `applicationIds`
    worksheet = addValidationColumnsToWorksheet(worksheet, columns, typeOptions, applicationIds);
    return workbook;
  }
  
  /**
   * Add dropdown columns with fixed options
   * @param {*} worksheet 
   * @param {*} columns 
   * @param {*} typeOptions 
   * @param {*} applicationIds 
   * @returns 
   */
  function addValidationColumnsToWorksheet(worksheet, columns, typeOptions, applicationIds) {
    const rowCount = applicationIds.length + 1; // number of rows to apply validation to (including header)
    for (let i = 1; i < columns.length + 1; i++) {
      const columnLetter = String.fromCharCode(i + 65);
      const column = columns[i - 1];
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
  }
};
