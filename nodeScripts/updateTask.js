'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const config = require('./shared/config');
const { updateTask } = require('../functions/actions/tasks/updateTask.js')(config, firebase, db);

const main = async () => {
  // return search.updateCandidate('05eaMEUNA0NfA6uhhd4kxYzU2of2');
  return updateTask({exerciseId: 'phf3iabh5KDhRiw4f4xm', type: 'criticalAnalysis'});
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
