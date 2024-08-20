'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initGenerateDiversityReport from '../functions/actions/exercises/generateDiversityReport.js';

const { generateDiversityReport } = initGenerateDiversityReport(config, firebase, db);

const main = async () => {
  //return generateDiversityReport('wdpALbyICL7ZxxN5AQt8');
  //return generateDiversityReport('yZrD8lLdIHbbwA6TD7AM');

  // @TOOD: Add your outreach stuff debugging in here!

  return generateDiversityReport('1qef6rsaSLvvsZHrJuw7');
};

main()
  .then((result) => {
    console.table(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
