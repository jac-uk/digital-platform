'use strict';

const config = require('./shared/config');
const { firebase, app } = require('./shared/admin.js');
const { runScannerTest } = require('../functions/actions/malware-scanning/runScannerTest')(config, firebase);

const main = async () => {
  return runScannerTest();
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
