'use strict';

const { app, firebase, db } = require('./shared/admin.js');
const checkServiceStatus = require('../functions/shared/checkServiceStatus.js')(firebase, db);

const main = async () => {
  return checkServiceStatus();
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
