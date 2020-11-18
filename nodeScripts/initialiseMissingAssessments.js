'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { initialiseMissingAssessments } = require('../functions/actions/assessments.js')(config, firebase, db);

const main = async () => {
  return initialiseMissingAssessments({
    exerciseId: 'LYybYFxgdeCzyC1vWZdY',
    stage: 'review',
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
