'use strict';

import { firebase, app, db } from './shared/admin.js';
import initRefreshTaskApplications from '../functions/actions/tasks/refreshTaskApplications.js';

const refreshTaskApplications = initRefreshTaskApplications(firebase, db);

const main = async () => {
  return refreshTaskApplications({
    exerciseId: '1qef6rsaSLvvsZHrJuw7',
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

