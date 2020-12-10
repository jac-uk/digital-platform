'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { initialiseMissingApplicationRecords } = require('../functions/actions/applicationRecords.js')(config, firebase, db);

const main = async () => {
  return initialiseMissingApplicationRecords({
    exerciseId: 'RWQnJPnzBoRvviG0JVzy',
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