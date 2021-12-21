'use strict';

const { app, db, auth } = require('./shared/admin.js');
const { adminGetUsers } = require('../functions/actions/userRoles')(db, auth);

const main = async () => {
  return adminGetUsers();
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
