'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { initialiseAssessments } = require('../functions/actions/assessments.js')(config, firebase, db);

const main = async () => {
  return initialiseAssessments({
    exerciseId: 'wdpALbyICL7ZxxN5AQt8', //'wdpALbyICL7ZxxN5AQt8',
    stage: 'shortlisted',
  });
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
