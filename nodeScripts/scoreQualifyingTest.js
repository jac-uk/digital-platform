'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const scoreQualifyingTest = require('../functions/actions/qualifyingTests/scoreQualifyingTest')(config, firebase, db);

const main = async () => {
  return scoreQualifyingTest({ qualifyingTestId: 'poUUaamsR5kJz1MsVYwN' });
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
