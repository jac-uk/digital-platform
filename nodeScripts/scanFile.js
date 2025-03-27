'use strict';
import { firebase, app } from './shared/admin.js';
import scanFileInit from '../functions/actions/malware-scanning/scanFile.js';

const scan = scanFileInit(firebase);

const main = async () => {
  return scan('exercise/1j25Hmhx4y1M1tF523FH/independent-assessors - 202491614128.docx');
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
