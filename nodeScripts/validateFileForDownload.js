'use strict';

import config from './shared/config.js';
import { app, db, firebase } from './shared/admin.js';
import { initValidateFileForDownload } from '../functions/actions/malware-scanning/validateFileForDownload.js';

const validateFileForDownload = initValidateFileForDownload(config, db, firebase);
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
