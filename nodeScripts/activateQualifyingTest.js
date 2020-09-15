'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const activateQualifyingTest = require('../functions/actions/qualifyingTests/activateQualifyingTest')(config, firebase, db);

const main = async () => {
  return activateQualifyingTest({
    qualifyingTestId: 'FdOGLjz1z42xVOhDX1IU',
  });
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
