'use strict';

const config = require('./shared/config');
const { auth, app, db } = require('./shared/admin.js');
const { initialiseApplicationRecords } = require('../functions/actions/applicationRecords')(config, db, auth);

const main = async () => {
  return initialiseApplicationRecords({
    exerciseId: 'rxqeJzA9WjZ21dEXf03p',
  });
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.log('Error encounted while processing');
    console.error(error);
    process.exit();
  });
