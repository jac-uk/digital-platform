'use strict';

const config = require('./shared/config');
const { auth, firebase, app, db } = require('./shared/admin.js');
const { initialiseApplicationRecords } = require('../functions/actions/applicationRecords')(config, firebase, db, auth);

const main = async () => {
  return initialiseApplicationRecords({
    exerciseId: 'e9F2sYm4WBE6vaZko7dG',
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
