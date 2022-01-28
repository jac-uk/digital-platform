'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { refreshApplicationCounts } = require('../functions/actions/exercises/refreshApplicationCounts')(firebase, db);

const main = async () => {
  return refreshApplicationCounts({ exerciseId: 'wdpALbyICL7ZxxN5AQt8' });
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
