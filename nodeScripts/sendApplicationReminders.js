'use strict';

const config = require('./shared/config');
const { app, db, auth } = require('./shared/admin.js');
const { sendApplicationReminders } = require('../functions/actions/applications/applications')(config, db, auth);

const main = async () => {
  return sendApplicationReminders({
    exerciseId: '',
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
