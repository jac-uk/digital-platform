'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const updateCharacterChecksStatus = require('../functions/actions/applicationRecords/updateCharacterChecksStatus')(config, firebase, db);

const main = async () => {
  return updateCharacterChecksStatus({ applicationRecordId: 'number', exerciseId: 'number' });
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
