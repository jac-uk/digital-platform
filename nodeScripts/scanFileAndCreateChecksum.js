'use strict';
import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import scanFileAndCreateChecksumInit from '../functions/actions/malware-scanning/scanFileAndCreateChecksum.js';

const scanFileAndCreateChecksum = scanFileAndCreateChecksumInit(config, firebase, db);

const main = async () => {
  let result = await scanFileAndCreateChecksum('blank.docx');
  return result;
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
