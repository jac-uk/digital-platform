'use strict';

import { app } from './shared/admin.js';
import { db, auth } from './shared/admin.js';
import initUsers from '../functions/actions/users.js';

const { getBugRotaUser } = initUsers(auth, db);

const spreadsheetId = '1E_ppJmSiI0uF7lpXXwuuDYD8PO2ETse316xgSgM1yCw';
const range = 'Sheet1';

const main = async () => {
  const result = await getBugRotaUser(spreadsheetId, range);
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
