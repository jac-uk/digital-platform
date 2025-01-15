'use strict';

import { app, auth } from './shared/admin.js';
import initCheckEnabledUserByEmail from '../functions/actions/candidates/checkEnabledUserByEmail.js';

const checkEnabledUserByEmail = initCheckEnabledUserByEmail(auth);

const candidateEmail = { email: 'wrongemail@bademailprovider.com'};

const main = async () => {
  return checkEnabledUserByEmail(candidateEmail);
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
