'use strict';

import { app, auth } from './shared/admin.js';
import initGetUserByEmail from '../functions/actions/candidates/getUserByEmail.js';

const getUserByEmail = initGetUserByEmail(auth);

const candidateEmail = { email: '<put the email to search here>'};

const main = async () => {
  return getUserByEmail(candidateEmail);
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
