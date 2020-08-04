'use strict';

const { app, db } = require('./shared/admin.js');
const eligibility = require('../functions/actions/applications/flagApplicationIssues')(db);

const main = async () => {
  // return eligibility.flagApplicationIssues('5RViNnHWNTppMumUKcPt');
  return eligibility.flagApplicationIssuesForExercise('wdpALbyICL7ZxxN5AQt8');
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
