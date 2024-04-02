'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { generateDiversityReport } = require('../functions/actions/exercises/generateDiversityReport')(config, firebase, db);

const main = async () => {
  //return generateDiversityReport('wdpALbyICL7ZxxN5AQt8');
  //return generateDiversityReport('yZrD8lLdIHbbwA6TD7AM');

  // @TOOD: Add your outreach stuff debugging in here!

  return generateDiversityReport('1qef6rsaSLvvsZHrJuw7');
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
