'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { generateOutreachReport } = require('../functions/actions/exercises/generateOutreachReport')(firebase, db);

const main = async () => {
  // wdpALbyICL7ZxxN5AQt8
  return generateOutreachReport('NhhpoB04aGqRcuP4T6Vk');
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
