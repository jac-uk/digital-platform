'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { generateAgencyReport } = require('../functions/actions/exercises/generateAgencyReport.js')(firebase, db);

const main = async () => {
  return generateAgencyReport('ofWyUMtAGBGj6AVck2tH');
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
