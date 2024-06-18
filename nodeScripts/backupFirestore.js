'use strict';

const config = require('./shared/config');
const { app, firebase } = require('./shared/admin.js');
const { backupFirestore } = require('../functions/actions/backup/firestore')(config, firebase);

const main = async () => {
  return backupFirestore();
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
