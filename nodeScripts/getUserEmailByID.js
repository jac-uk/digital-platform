'use strict';

const { app, auth } = require('./shared/admin.js');
const getUserEmailByID = require('../functions/actions/candidates/getUserEmailByID')(auth);

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
