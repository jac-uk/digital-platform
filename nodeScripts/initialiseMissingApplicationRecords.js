'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const initialiseMissingApplicationRecords = require('../functions/callableFunctions/initialiseMissingApplicationRecords')(config, firebase, db);
// /initialiseMissingApplicationRecords')(config, firebase, db);


const main = async () => {
  return initialiseMissingApplicationRecords({
    exerciseId: '27XRfjOU65Nd1enzLsLt',
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
