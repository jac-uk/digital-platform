'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { generateOutreachReport } = require('../functions/actions/exercises/generateOutreachReport.js')(firebase, db);

const main = async () => {

  // @TOOD: Add your outreach stuff debugging in here!

  return generateOutreachReport('1qef6rsaSLvvsZHrJuw7');
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
