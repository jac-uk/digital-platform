'use strict';

const config = require('./shared/config');
const { app, firebase, db } = require('./shared/admin.js');
const verifyChecksum = require('../functions/actions/malware-scanning/verifyFileChecksum')(config, firebase, db);

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
