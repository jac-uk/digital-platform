'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { generateReasonableAdjustmentsReport } = require('../functions/actions/exercises/generateReasonableAdjustmentsReport')(firebase, db);

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
