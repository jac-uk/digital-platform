'use strict';

const config = require('./shared/config');
const { app, firebase, db } = require('./shared/admin.js');
const emptyQualifyingTest = require('../functions/actions/qualifyingTests/emptyQualifyingTest')(config, firebase, db);

const main = async () => {
  return emptyQualifyingTest({
    qualifyingTestId: 'ExCnXLxi6OQHOaQonAr6',
  });
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
