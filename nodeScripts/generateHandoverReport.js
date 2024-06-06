'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { generateHandoverReport } = require('../functions/actions/exercises/generateHandoverReport')(firebase, config, db);

const main = async () => {
  return generateHandoverReport('ofWyUMtAGBGj6AVck2tH');
};

main()
  .then((result) => {
    result;
    console.log('result', result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
