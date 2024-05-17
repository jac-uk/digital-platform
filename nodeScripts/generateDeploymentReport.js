'use strict';

const config = require('./shared/config');
const { app, db } = require('./shared/admin.js');
const { generateDeploymentReport } = require('../functions/actions/exercises/generateDeploymentReport.js')(config, db);

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
