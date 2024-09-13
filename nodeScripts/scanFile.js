'use strict';
import config from './shared/config.js';
import { firebase, app } from './shared/admin.js';
import scanFileInit from '../functions/actions/malware-scanning/scanFile.js';

const scan = scanFileInit(config, firebase);

const main = async () => {
  return scan('blank.docx');
};

main()
  .then((result) => {
    console.log(result.statusText);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
