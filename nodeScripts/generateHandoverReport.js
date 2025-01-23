'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initGenerateHandoverReport from '../functions/actions/exercises/generateHandoverReport.js';

const { generateHandoverReport } = initGenerateHandoverReport(firebase, config, db);

// Live: IiaXjmpDQd7BQx7ovlv0, R5mu47EVqEPf1WbXsLfZ, Bfoe64GS5GoDOSgXz2GT, T0UYPpfHpLUDLdYWlnQI, IiaXjmpDQd7BQx7ovlv0

const forAdminDisplay = true;

const main = async () => {
  return generateHandoverReport('IiaXjmpDQd7BQx7ovlv0', forAdminDisplay);
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
