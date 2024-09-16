'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initCreateTask from '../functions/actions/tasks/createTask.js';

const createTask = initCreateTask(config, firebase, db);

const main = async () => {
  return createTask({
    exerciseId: 'R5mu47EVqEPf1WbXsLfZ',
    type: 'selectionDay',
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
 
