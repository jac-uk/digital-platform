'use strict';

/**
 * Get number of candidates who have completed 2FA since a specific date
 */

import { app, db, auth } from '../shared/admin.js';
import initInternalReporting from '../../functions/actions/internalReporting.js';

const { getNumCandidatesCompleted2FASinceDate } = initInternalReporting(db, auth);

const main = async () => {
  const num = await getNumCandidatesCompleted2FASinceDate();
  return num;
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
