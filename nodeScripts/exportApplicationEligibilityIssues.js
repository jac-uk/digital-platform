'use strict';

import { firebase, app, db } from './shared/admin.js';
import initExportApplicationEligibilityIssues from '../functions/actions/exercises/exportApplicationEligibilityIssues.js';

const { exportApplicationEligibilityIssues } = initExportApplicationEligibilityIssues(firebase, db);

const main = async () => {
  return exportApplicationEligibilityIssues('aRrY8ad5TwiznZZhBqee', 'googledoc');
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
