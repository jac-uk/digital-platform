'use strict';

const config = require('./shared/config');
const { app, firebase, db } = require('./shared/admin.js');
const emptyQualifyingTest = require('../functions/actions/qualifyingTests/emptyQualifyingTest')(config, firebase, db);

const main = async () => {
  return emptyQualifyingTest({
    qualifyingTestId: '2bpbIve3vKn9IJpVwUWC',
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
