'use strict';

const { app, auth } = require('./shared/admin.js');
const getUserByEmail = require('../functions/actions/candidates/getUserByEmail')(auth);

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
