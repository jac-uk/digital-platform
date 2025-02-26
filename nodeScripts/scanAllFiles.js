'use strict';

import { firebase, app } from './shared/admin.js';
import initScanAllFiles from '../functions/actions/malware-scanning/scanAllFiles.js';

const { scanAllFiles } = initScanAllFiles(firebase);

const main = async () => {
  return scanAllFiles(false, 500);
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
