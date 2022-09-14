'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const initialiseQualifyingTest = require('../functions/actions/qualifyingTests/initialiseQualifyingTest')(config, firebase, db);

const main = async () => {
  return initialiseQualifyingTest({
    qualifyingTestId: 'kaPbK2RCRSFA914eCw7Z',
    stage: 'selected',
    status: 'passedButNotRecommended',
  });
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.log(error);
    process.exit();
  });
