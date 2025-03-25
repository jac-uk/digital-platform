'use strict';

import { app, auth } from './shared/admin.js';
import initFetchSignInMethodsForEmail from '../functions/actions/candidates/fetchSignInMethodsForEmail.js';

const fetchSignInMethodsForEmail = initFetchSignInMethodsForEmail(auth);

const candidateEmail = { email: 'application-0004@jac-dummy-email.jac'};

const main = async () => {
  return fetchSignInMethodsForEmail(candidateEmail);
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
