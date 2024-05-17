'use strict';

const { app, db } = require('./shared/admin.js');
const { exportApplicationCharacterIssues } = require('../functions/actions/exercises/exportApplicationCharacterIssues')(db);

const main = async () => {
  return exportApplicationCharacterIssues('aRrY8ad5TwiznZZhBqee', 'all', 'all', 'googledoc');
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
