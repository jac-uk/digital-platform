'use strict';

import config from './shared/config.js';
import { firebase, app } from './shared/admin.js';
import initScanAllFiles from '../functions/actions/malware-scanning/scanAllFiles.js';

const { scanAllFiles } = initScanAllFiles(config, firebase);

const main = async () => {
  return scanAllFiles(true, 500);
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
