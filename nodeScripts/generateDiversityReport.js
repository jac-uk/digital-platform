'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { generateDiversityReport } = require('../functions/actions/exercises/generateDiversityReport')(firebase, db);

const main = async () => {
  return generateDiversityReport('wdpALbyICL7ZxxN5AQt8');
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
