'use strict';

import { firebase, app, db } from './shared/admin.js';
import initGenerateDeploymentReport from '../functions/actions/exercises/generateDeploymentReport.js';

const { generateDeploymentReport } = initGenerateDeploymentReport(firebase, db);

const main = async () => {
  return generateDeploymentReport('aDxEqK36807d0Nhpugo3');
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
