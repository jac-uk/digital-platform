'use strict';

const { app, auth } = require('./shared/admin.js');
const updateEmailAddress = require('../functions/actions/candidates/updateEmailAddress')(auth);

const main = async () => {
  return updateEmailAddress({
    currentEmailAddress: 'enter email here',
    newEmailAddress: 'enter email here',
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
