'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { refreshApplicationCounts } = require('../functions/actions/exercises/refreshApplicationCounts')(firebase, db);

const main = async () => {

  // Exercise on DEVELOP
  const exerciseId = 'wdpALbyICL7ZxxN5AQt8';
  return refreshApplicationCounts({ exerciseId: exerciseId });
};

main()
  .then((result) => {
    console.table(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
