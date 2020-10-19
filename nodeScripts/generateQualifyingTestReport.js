'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { generateQualifyingTestReport } = require('../functions/actions/qualifyingTests/generateQualifyingTestReport')(config, firebase, db);

const main = async () => {
  return generateQualifyingTestReport('z4WuRZxkfRYvOpEeCuu0');
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
