'use strict';

import { app, auth } from './shared/admin.js';
import initCheckSignInMethodsForEmail from '../functions/actions/candidates/checkSignInMethodsForEmail.js';

const checkSignInMethodsForEmail = initCheckSignInMethodsForEmail(auth);

const candidateEmail = 'application-0004@jac-dummy-email.jac';

const main = async () => {
  return checkSignInMethodsForEmail(candidateEmail);
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
