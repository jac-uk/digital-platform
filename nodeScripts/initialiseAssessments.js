'use strict';

/**
 * Nodescript for initialising independent assessment (IA)
 */

import config from './shared/config.js';
import { auth, firebase, app, db } from './shared/admin.js';
import initAssessments from '../functions/actions/assessments.js';

const { initialiseAssessments } = initAssessments(config, firebase, db, auth);

const main = async () => {
  return initialiseAssessments({
    exerciseId: 'qsBv15StHEVEp1RY20cS',
    applicationId: 'vj0TUX7ufq6UYjYqNZLJ',
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
