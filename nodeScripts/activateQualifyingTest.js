'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const activateQualifyingTest = require('../functions/actions/qualifyingTests/activateQualifyingTest')(config, firebase, db);

const main = async () => {
  return activateQualifyingTest({
    qualifyingTestId: 'l0w8PeHoi06IpAXjFdEC',
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
