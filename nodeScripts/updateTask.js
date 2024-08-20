'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { updateTask } = require('../functions/actions/tasks/updateTask')(config, firebase, db);

const main = async () => {
  return updateTask({
    exerciseId: '',
    type: 'criticalAnalysis',
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
 
