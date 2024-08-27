'use strict';

import config from './shared/config.js';
import { db, app, firebase } from './shared/admin.js';
import { runScannerTestFile } from '../functions/actions/malware-scanning/runScannerTest.js';
const runScannerTest = runScannerTestFile(config, firebase, db);

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
