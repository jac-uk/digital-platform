
import config from '../shared/config.js';
import { firebase, app, db } from '../shared/admin.js';
import initCustomReport from '../../functions/actions/exercises/customReport.js';
import ExcelJS from 'exceljs';
import path  from 'path';

const { getColumnUsage } = initCustomReport(config, firebase, db);

const exportToExcel = async (data, filePath) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Cutom Reports Column Counts');

  // Add headers
  worksheet.columns = [
    { header: 'Column', key: 'string', width: 100 },
    { header: 'Count', key: 'count', width: 15 },
  ];

  // Add rows from the data array
  data.forEach(([string, count]) => {
    worksheet.addRow({ string, count });
  });

  // Save the file
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file saved at ${filePath}`);
};

const main = async () => {
  // GET DATA
  //await getColumnUsage();
  //await getColumnUsage('alphabetical');
  const results = await getColumnUsage('count');

  const fileName = 'custom-report-column-usage.xlsx';
  const nestedDir = path.join(process.cwd(), 'nodeScripts', 'temp');
  const filePath = path.join(nestedDir, fileName);
  await exportToExcel(results, filePath);
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
