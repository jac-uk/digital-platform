'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initGenerateOutreachReport from '../functions/actions/exercises/generateOutreachReport.js';

const { generateOutreachReport } = initGenerateOutreachReport(config, firebase, db);

const main = async () => {

  // @TOOD: Add your outreach stuff debugging in here!

  return generateOutreachReport('1qef6rsaSLvvsZHrJuw7');
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
