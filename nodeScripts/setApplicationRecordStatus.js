'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const setApplicationRecordStatus = require('../functions/actions/applicationRecords/setApplicationRecordStatus')(config, firebase, db);

const main = async () => {
  return setApplicationRecordStatus({
    exerciseId: 'wdpALbyICL7ZxxN5AQt8',
    referenceNumbers: ['testData-551', 'testData-552', 'testData-553', 'testData-554', 'testData-555'],
    newStatus: 'passedFirstTest',
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
