'use strict';

const config = require('./shared/config');
const { firebase, app } = require('./shared/admin.js');
const { scanFile } = require('../functions/actions/malware-scanning/scanFile')(config, firebase);

const main = async () => {
  return scanFile('blank.docx');
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
