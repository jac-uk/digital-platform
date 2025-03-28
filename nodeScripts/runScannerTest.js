'use strict';

import { db, app, firebase } from './shared/admin.js';
import runScannerTestInit from '../functions/actions/malware-scanning/runScannerTest.js';
const runScannerTest = runScannerTestInit(firebase, db);

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
