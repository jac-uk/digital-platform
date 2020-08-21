'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const sendQualifyingTestReminders = require('../functions/actions/qualifyingTests/sendQualifyingTestReminders')(config, firebase, db);

const main = async () => {
  return sendQualifyingTestReminders({
    qualifyingTestId: 'b1CXcAabEw95PQreh9T1',
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
