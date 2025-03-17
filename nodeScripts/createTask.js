'use strict';

import { firebase, app, db } from './shared/admin.js';
import initCreateTask from '../functions/actions/tasks/createTask.js';

const createTask = initCreateTask(firebase, db);

const main = async () => {
  return createTask({
    exerciseId: 'nKtO8nAdvFFVBEEbvm4Z',
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

