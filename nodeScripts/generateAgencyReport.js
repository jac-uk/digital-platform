'use strict';

const { app, db } = require('./shared/admin.js');
const { generateAgencyReport } = require('../functions/actions/exercises/generateAgencyReport.js')(db);

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
