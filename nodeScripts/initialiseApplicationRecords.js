'use strict';

const config = require('./shared/config');
const { app, firebase, db } = require('./shared/admin.js');
const { initialiseApplicationRecords } = require('../functions/actions/applicationRecords.js')(config, firebase, db);

const main = async () => {
  return initialiseApplicationRecords({
    exerciseId: 'wdpALbyICL7ZxxN5AQt8',
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
