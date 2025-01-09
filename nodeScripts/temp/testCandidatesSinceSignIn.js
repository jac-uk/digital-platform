'use strict';

/**
 * Get a list of candidates who 
 */

import { app, db, auth } from '../shared/admin.js';
import initUserRoles from '../../functions/actions/userRoles.js';
import path  from 'path';

//import { createObjectCsvWriter } from 'csv-writer';
import ExcelJS from 'exceljs';

const { getCandidatesSinceSignInDate } = initUserRoles(db, auth);

const exportToExcel = async (data, filePath) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Candidates Who Signed In On Or After 01-01-2024');

  // Add headers
  worksheet.columns = [
    // { header: 'Column', key: 'string', width: 100 },
    // { header: 'Count', key: 'count', width: 15 },
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

  // GET DATA
  const results = await getCandidatesSinceSignInDate('2024-01-01');

  console.log('results:');
  console.log(results);

  const fileName = 'candidates-signin-since-01-01-2024.xlsx';
  const nestedDir = path.join(process.cwd(), 'nodeScripts', 'temp');
  const filePath = path.join(nestedDir, fileName);
  await exportToExcel(results, filePath);




  // @TODO: You've got the users coming back just need to find ur nodescript where you're writing the data to a csv!

  const candidates = await getCandidatesSinceSignInDate('2024-01-01');

  // const headers = [
  //   { id: 'uid', title: 'User ID' },
  //   { id: 'email', title: 'Email' },
  //   { id: 'fullName', title: 'Full Name' },
  //   { id: 'displayName', title: 'Display Name' },
  //   { id: 'lastSignInDate', title: 'Last Signed In' },
  // ];

  // const csvWriter = createObjectCsvWriter({
  //   path: 'output.csv',
  //   header: headers,
  // });

  // const writeCsvFile = async () => {
  //   try {
  //     await csvWriter.writeRecords(candidates);
  //     console.log('CSV file written successfully.');
  //   } catch (error) {
  //     console.error('Error writing CSV file:', error);
  //   }
  // };
  
  // writeCsvFile();


  return candidates.length;

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
