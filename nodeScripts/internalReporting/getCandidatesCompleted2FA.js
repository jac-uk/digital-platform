'use strict';

/**
 * Get list of candidates who have completed 2FA since a specific date
 */

import { app, db, auth } from '../shared/admin.js';
import initInternalReporting from '../../functions/actions/internalReporting.js';
import path  from 'path';

import ExcelJS from 'exceljs';

const { getCandidatesCompleted2FASinceDate } = initInternalReporting(db, auth);

const exportToExcel = async (data, filePath) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Candidates Who Completed 2FA');

  // Add headers
  worksheet.columns = [
    { header: 'Full Name', key: 'fullName', width: 30 },
    { header: 'Email', key: 'email', width: 50 },
    { header: '2FA Verified Date', key: 'twoFactorAuthVerifiedAt', width: 20 },
  ];

  // Add rows from the data array
  data.forEach(([ fullName, email, twoFactorAuthVerifiedAt ]) => {
    worksheet.addRow({ fullName, email, twoFactorAuthVerifiedAt });
  });

  // Save the file
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file saved at ${filePath}`);
};

const main = async () => {
  const results = await getCandidatesCompleted2FASinceDate();
  const fileName = 'candidates-2FA.xlsx';
  const nestedDir = path.join(process.cwd(), 'nodeScripts', 'temp');
  const filePath = path.join(nestedDir, fileName);
  await exportToExcel(results, filePath);
  return results.length;
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
