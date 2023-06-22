'use strict';

const { app, auth } = require('./shared/admin.js');
const checkEnabledUserByEmail = require('../functions/actions/candidates/checkEnabledUserByEmail.js')(auth);

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
