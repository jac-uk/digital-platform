'use strict';

/**
 * Get a list of candidates who have signed in after a specific date
 */

import { app, db, auth } from '../shared/admin.js';
import initUserRoles from '../../functions/actions/userRoles.js';
import path  from 'path';

import ExcelJS from 'exceljs';

const { getCandidatesSinceSignInDate } = initUserRoles(db, auth);

const exportToExcel = async (data, filePath) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Candidates Who Signed In On Or After 01-01-2024');

  // Add headers
  worksheet.columns = [
    { header: 'User ID', key: 'uid', width: 100 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Full Name', key: 'fullName', width: 30 },
    { header: 'Display Name', key: 'displayName', width: 50 },
    { header: 'Last Signed In', key: 'lastSignedIn', width: 15 },

  ];

  // Add rows from the data array
  data.forEach(([ uid, email, fullName, displayName, lastSignedIn ]) => {
    worksheet.addRow({ uid, email, fullName, displayName, lastSignedIn });
  });

  // Save the file
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file saved at ${filePath}`);
};

const main = async () => {
  const results = await getCandidatesSinceSignInDate('2024-01-01');
  const fileName = 'candidates-signin.xlsx';
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
