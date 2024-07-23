'use strict';

const config = require('./shared/config');
const { app, db, firebase } = require('./shared/admin.js');
const { validateFileForDownload } = require('../functions/actions/malware-scanning/validateFileForDownload')(config, db, firebase);

const fileURL = 'blank.docx';

const main = async () => {
  return validateFileForDownload(fileURL);
};

main()
  .then((result) => {
    console.log('Validation result:', result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('Error occurred during validation:', error);
    app.delete();
    return process.exit();
  });
