'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initUpdateTask from '../functions/actions/tasks/updateTask.js';

const { updateTask } = initUpdateTask(config, firebase, db);

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
 
