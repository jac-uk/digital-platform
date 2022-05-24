'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { exportApplicationEligibilityIssues } = require('../functions/actions/exercises/exportApplicationEligibilityIssues')(firebase, db);

const main = async () => {
  return exportApplicationEligibilityIssues('aRrY8ad5TwiznZZhBqee', 'all', 'all', 'googledoc');
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
