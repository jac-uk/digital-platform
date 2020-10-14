'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const scoreQualifyingTest = require('../functions/actions/qualifyingTests/scoreQualifyingTest')(config, firebase, db);

const main = async () => {
  return scoreQualifyingTest({
    qualifyingTestId: 'cmPKcqS0oDR9SGmX7EzE',
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
