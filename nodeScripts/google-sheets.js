'use strict';

import { app } from './shared/admin.js';
import { google } from 'googleapis';

const main = async (spreadsheetId, range) => {

  return google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  .then(auth => {
      return google.sheets({ version: 'v4', auth }).spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          ['Candidate Ref', 'Score'],
          ['Candidate1'],
          ['Candidate2'],
          ['Candidate3'],
          ['Candidate4'],
          ['Candidate5'],
          ['Candidate6'],
          ['Candidate7'],
          ['Candidate8'],
        ],
      },
    });
  })
  .then(({ data: { sheets } }) => {
    return sheets;
  })
  .catch(err => {
    return err;
  });
};


main('1kOLipXEe657tKsreRbxc9uIC5x5TmOzLmpdAQONNsLA', 'A1:Z1000')
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
