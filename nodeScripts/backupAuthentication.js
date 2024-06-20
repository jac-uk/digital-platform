'use strict';

const config = require('./shared/config');
const { app, firebase } = require('./shared/admin.js');
const { backupAuthentication } = require('../functions/actions/backup/authentication')(config, firebase);

const main = async () => {
  return backupAuthentication();
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
