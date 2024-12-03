'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initExportApplicationEligibilityIssues from '../functions/actions/exercises/exportApplicationEligibilityIssues.js';

const { exportApplicationEligibilityIssues } = initExportApplicationEligibilityIssues(firebase, db, config);

const main = async () => {
  // return exportApplicationEligibilityIssues('aRrY8ad5TwiznZZhBqee', 'googledoc');
  return exportApplicationEligibilityIssues('qFq56CNoUIJxp3dJMAGc', 'annex', null );
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
