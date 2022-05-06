'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { exportApplicationCharacterIssues } = require('../functions/actions/exercises/exportApplicationCharacterIssues')(firebase, db);

const main = async () => {
  return exportApplicationCharacterIssues('Yt04PxbBde5nfZxNgFWx', 'all', 'all');
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
