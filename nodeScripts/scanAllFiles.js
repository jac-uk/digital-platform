'use strict';

const config = require('./shared/config');
const { app, storage } = require('./shared/admin.js');
const { scanAllFiles } = require('../functions/actions/malware-scanning/scanAllFiles')(config, app, storage);

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
