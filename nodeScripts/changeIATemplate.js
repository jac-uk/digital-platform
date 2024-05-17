'use strict';

const config = require('./shared/config');
const { app, db } = require('./shared/admin.js');
const { changeIATemplate: changeIATemplate } = require('../functions/actions/changeIATemplate')(config, db);

const main = async () => {
  return changeIATemplate (
    ''); // enter exercise id
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
