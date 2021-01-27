'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { google } = require('googleapis');
const { promisify } = require('util');

const main = async () => {
  return google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }).then(auth => {
    const api = google.sheets({ version: 'v4', auth });
    const getSheets = promisify(api.spreadsheets.get.bind(api.spreadsheets));
    return getSheets({ spreadsheetId: '1kOLipXEe657tKsreRbxc9uIC5x5TmOzLmpdAQONNsLA' });
  })
  // This just prints out all Worksheet names as an example
  .then(({ data: { sheets } }) => {
    return sheets;
  })
  .catch(err => {
    return err;
  });
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
