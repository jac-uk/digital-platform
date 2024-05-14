'use strict';

const config = require('./shared/config');
const { firebase, app } = require('./shared/admin.js');
const { checkScannerStatus } = require('../functions/actions/malware-scanning/checkScannerStatus')(config, firebase);

const main = async () => {
  return checkScannerStatus();
};

main()
  .then((result) => {
    console.log('RESULT ',result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
