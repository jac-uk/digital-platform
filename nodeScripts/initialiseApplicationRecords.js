'use strict';

import { auth, firebase, app, db } from './shared/admin.js';
import initApplicationRecords from '../functions/actions/applicationRecords.js';

const { initialiseApplicationRecords } = initApplicationRecords(firebase, db, auth);

const main = async () => {
  return initialiseApplicationRecords({
    exerciseId: 'p4DnfgusUqaoRP6ZCXpM',
  });
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.log('Error encounted while processing');
    console.error(error);
    process.exit();
  });
