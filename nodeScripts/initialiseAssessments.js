'use strict';

/**
 * Nodescript for initialising independent assessment (IA)
 */

const config = require('./shared/config.js');
const { auth, app, db } = require('./shared/admin.js');
const { initialiseAssessments } = require('../functions/actions/assessments.js')(config, db, auth);

const main = async () => {
  return initialiseAssessments({
    exerciseId: 'BpEL3HgHEyHCvDMI5E9s',
    applicationId: 's5xUIUNY7imVdNUmM6v0',
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
