'use strict';

import config from './shared/config.js';
import { app, firebase, db } from './shared/admin.js';
import verifyChecksumFile from '../functions/actions/malware-scanning/verifyFileChecksum.js';
const verifyChecksum = verifyChecksumFile(config, firebase, db);

const fileURL = 'blank.docx';

const main = async () => {
  const result = await verifyChecksum(fileURL);
  return result;
};

main()
  .then((result) => {
    console.log('Validation result:', result);
    app.delete();
    return process.exit(0); // Exit cleanly
  })
  .catch((error) => {
    console.error('Error occurred during validation:', error);
    app.delete();
    return process.exit(1); // Exit with an error code
  });
