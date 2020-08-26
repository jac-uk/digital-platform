'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const initialiseQualifyingTest = require('../functions/actions/qualifyingTests/initialiseQualifyingTest')(config, firebase, db);

const main = async () => {
  return initialiseQualifyingTest({
    qualifyingTestId: 'BEWBtYhSVB56NWTgPptj',
    stage: 'selected',
    // status: '', // @TODO only invite applications with a certain status
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
