'use strict';

import { firebase, app, db } from './shared/admin.js';
import initGenerateReasonableAdjustmentsReport from '../functions/actions/exercises/generateReasonableAdjustmentsReport.js';

const { generateReasonableAdjustmentsReport } = initGenerateReasonableAdjustmentsReport(firebase, db);

const main = async () => {
  return generateReasonableAdjustmentsReport('ZutEH7OHcjRlUIfXLyqP');
};

main()
  .then((result) => {
    result;
    console.log('result');
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
