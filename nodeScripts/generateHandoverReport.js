'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { generateHandoverReport } = require('../functions/actions/exercises/generateHandoverReport')(firebase, db);

const main = async () => {
  return generateHandoverReport('Yt04PxbBde5nfZxNgFWx');
};

main()
  .then((result) => {
    result;
    console.log('result');
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
