'use strict';

/**
 * Nodescript for initialising independent assessment (IA)
 */

import { auth, firebase, app, db } from './shared/admin.js';
import initAssessments from '../functions/actions/assessments.js';

const { initialiseAssessments } = initAssessments(firebase, db, auth);

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
