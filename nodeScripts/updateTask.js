'use strict';

import { firebase, app, db } from './shared/admin.js';
import initUpdateTask from '../functions/actions/tasks/updateTask.js';

const { updateTask } = initUpdateTask(firebase, db);

const main = async () => {
  return updateTask({
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
 
