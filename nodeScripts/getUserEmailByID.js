'use strict';

import { app, auth } from './shared/admin.js';
import initGetUserEmailByID from '../functions/actions/candidates/getUserEmailByID.js';

const getUserEmailByID = initGetUserEmailByID(auth);

const main = async () => {
  return getUserEmailByID({
    candidateId: 'enter candidate id here',
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
