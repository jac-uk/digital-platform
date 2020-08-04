'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { onApplicationRecordUpdate } = require('../functions/actions/applicationRecords')(config, firebase, db);

const main = async () => {
  const dataBefore = {
    exercise: {
      id: 'wdpALbyICL7ZxxN5AQt8',
    },
    stage: 'shortlisted',
  };
  const dataAfter = {
    exercise: {
      id: 'wdpALbyICL7ZxxN5AQt8',
    },
    stage: 'review',
  };
  return onApplicationRecordUpdate(dataBefore, dataAfter);
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
