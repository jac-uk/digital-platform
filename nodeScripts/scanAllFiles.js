'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { scanAllFiles } = require('../functions/actions/malware-scanning/scanAllFiles')(config, firebase, db);

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
