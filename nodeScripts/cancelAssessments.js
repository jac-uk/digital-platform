'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { cancelAssessments } = require('../functions/actions/assessments.js')(config, firebase, db);

const main = async () => {
  return cancelAssessments({ exerciseId: 'wdpALbyICL7ZxxN5AQt8' });
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
