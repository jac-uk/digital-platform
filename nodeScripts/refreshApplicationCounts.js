'use strict';

import { firebase, app, db } from './shared/admin.js';
import initRefreshApplicationCounts from '../functions/actions/exercises/refreshApplicationCounts.js';

const { refreshApplicationCounts } = initRefreshApplicationCounts(firebase, db);

const main = async () => {

  // Exercise on DEVELOP
  const exerciseId = 'wdpALbyICL7ZxxN5AQt8';
  return refreshApplicationCounts({ exerciseId: exerciseId });
};

main()
  .then((result) => {
    console.table(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
