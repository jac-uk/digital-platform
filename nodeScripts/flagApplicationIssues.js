'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { flagApplicationIssuesForExercise } = require('../functions/actions/applications/flagApplicationIssues')(firebase, config, db);

const main = async () => {
  return flagApplicationIssuesForExercise('wdpALbyICL7ZxxN5AQt8');
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
