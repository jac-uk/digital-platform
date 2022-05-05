'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { initialiseApplicationRecords } = require('../functions/actions/applicationRecords')(config, firebase, db);

const main = async () => {
  return initialiseApplicationRecords({
    exerciseId: '8CIlAsDbtMfr2vnfjmYh',
  });
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.log('Error encounted while processing');
    console.error(error);
    process.exit();
  });