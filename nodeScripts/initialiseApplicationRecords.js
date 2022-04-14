'use strict';

const config = require('./shared/config');
const { auth, firebase, app, db } = require('./shared/admin.js');
const { initialiseApplicationRecords } = require('../functions/actions/applicationRecords')(config, auth, firebase, db);

const main = async () => {
  return initialiseApplicationRecords({
    exerciseId: '4xP8RY7GeoaS1yKqYJLw',
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
