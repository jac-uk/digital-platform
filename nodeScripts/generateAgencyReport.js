'use strict';

import { firebase, app, db } from './shared/admin.js';
import initGenerateAgencyReport from '../functions/actions/exercises/generateAgencyReport.js';

const { generateAgencyReport } = initGenerateAgencyReport(firebase, db);

const main = async () => {
  return generateAgencyReport('ofWyUMtAGBGj6AVck2tH');
};

main()
  .then((result) => {
    console.log('result', result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
