'use strict';
import config from './shared/config.js';
import { firebase, app } from './shared/admin.js';
import { scanFile } from '../functions/actions/malware-scanning/scanFile.js';

const scan = scanFile(config, firebase);

const main = async () => {
  return scan('blank.docx');
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
