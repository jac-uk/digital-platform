'use strict';

import { app, db } from './shared/admin.js';
import { getDocuments } from '../functions/shared/helpers.js';


const main = async () => {

  const exerciseId = 'kVlymRGRhZndRaQuqDTf';

  // get data
  const applications = await getDocuments(
    db.collection('applications')
    .where('exerciseId', '==', exerciseId)
    .where('status', '==', 'applied')
  );

  const filteredData = [];
  applications.forEach(application => {
    if (application.additionalWorkingPreferences[0].selection === 'Yes') {
      filteredData.push(application);
    }
  });

  // row data
  const rows = [];
  filteredData.forEach(application => {
    const row = {
      referenceNumber: application.referenceNumber,
      fullName: application.personalDetails.fullName,
      citizenship: application.personalDetails.citizenship,
      dateOfBirth: application.personalDetails.dateOfBirth,
      // Date of Birth – linked to 24/06/2021(so we can calculate Reasonable Length of Service
      // Qualification – Solicitor or Barrister
      // Post Qualification Experience – this is the date entered on the Roll for Solicitor and date completed pupillage for a Barrister – we are looking for at least 7 years
      // Character
    };
    rows.push(row);
  });

  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const headers = [
    { id: 'referenceNumber', title: 'Ref' },
    { id: 'fullName', title: 'Name' },
  ];
  const output = createCsvWriter({
    path: 'output.csv',
    header: headers,
  });
  await output.writeRecords(rows);

  return true;
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
