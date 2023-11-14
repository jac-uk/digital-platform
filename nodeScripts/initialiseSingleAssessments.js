'use strict';

const config = require('./shared/config.js');
const { firebase, app, db } = require('./shared/admin.js');
const { initialiseAssessments } = require('../functions/actions/assessments.js')(config, firebase, db);

const main = async () => {
  return initialiseAssessments({
    exerciseId: 'jFohU9YooUvW2qsEixIz',
    applicationId: 'JArGXGEDoNF1cT4skFyx',
  });
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.log('Error encounted while processing');
    console.error(error);
    process.exit();
  });
