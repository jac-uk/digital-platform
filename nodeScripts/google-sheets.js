'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { google } = require('googleapis');
// const { getDocument } = require('../functions/shared/helpers');
// const { object } = require('firebase-functions/lib/providers/storage');
// const { promisify } = require('util');

const main = async (spreadsheetId, range) => {
  // const application = await getDocument(db.collection('applications').doc('testData-1'));
  // console.log(Object.keys(application));
  // console.table(application);
  // console.table(app);
  // console.table(db);

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
