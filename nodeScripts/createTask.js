'use strict';

import { firebase, app, db } from './shared/admin.js';
import initCreateTask from '../functions/actions/tasks/createTask.js';

const createTask = initCreateTask(process.env.QT_KEY, firebase, db);

const main = async () => {
  console.log('qt key (process)', process.env.QT_KEY);
  return createTask({
    exerciseId: 'kT7GfUeNwp5DsYkgEQIH',
    type: 'sift',
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

