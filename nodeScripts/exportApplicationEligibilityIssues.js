'use strict';

const { app, db } = require('./shared/admin.js');
const { exportApplicationEligibilityIssues } = require('../functions/actions/exercises/exportApplicationEligibilityIssues')(db);

const main = async () => {
  return exportApplicationEligibilityIssues('aRrY8ad5TwiznZZhBqee', 'googledoc');
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
