'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const exportCustom021Data = require('../functions/actions/exercises/exportCustom021Data')(firebase, db);

const main = async () => {
  return exportCustom021Data(
    'exercise id here',
  );
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
