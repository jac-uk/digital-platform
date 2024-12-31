'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initGenerateHandoverReport from '../functions/actions/exercises/generateHandoverReport.js';

const { generateHandoverReport } = initGenerateHandoverReport(firebase, config, db);

const main = async () => {
  return generateHandoverReport('ofWyUMtAGBGj6AVck2tH');
};

main()
  .then((result) => {
    result;
    console.log('result', result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
