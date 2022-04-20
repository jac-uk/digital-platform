'use strict';

const { app, db } = require('./shared/admin.js');
const { checkFunctionEnabled } = require('../functions/shared/serviceSettings.js')(db);

const main = async () => {
  await checkFunctionEnabled();
  return;
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
