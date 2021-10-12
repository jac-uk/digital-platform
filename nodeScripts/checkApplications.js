'use strict';

const config = require('./shared/config');
const { app, db } = require('./shared/admin.js');
const { checkApplications } = require('../functions/actions/applications/checkApplications')(config, db);

const main = async () => {
  return checkApplications('');
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
