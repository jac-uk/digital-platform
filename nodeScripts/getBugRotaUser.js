'use strict';

import { app } from './shared/admin.js';
import { db, auth } from './shared/admin.js';
import initUsers from '../functions/actions/users.js';

const { getBugRotaUser } = initUsers(auth, db);

const main = async () => {
  const result = await getBugRotaUser();
  return result;
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
