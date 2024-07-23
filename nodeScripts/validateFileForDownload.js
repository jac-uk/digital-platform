'use strict';
import config from './shared/config.js';
import { app, db, firebase } from './shared/admin.js';
import { validateFileForDownload } from '../functions/actions/malware-scanning/validateFileForDownload.js';

const validateFile = validateFileForDownload(config, db, firebase);

const fileURL = 'blank.docx';

const main = async () => {
  return validateFile(fileURL);
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
