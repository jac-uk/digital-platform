'use strict';

import { app, db, auth } from './shared/admin.js';
import initUserRoles from '../functions/actions/userRoles.js';

const { adminGetUsers } = initUserRoles(db, auth);

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
