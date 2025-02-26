'use strict';

import { firebase, app, db, auth } from './shared/admin.js';
import initApplicationRecords from '../functions/actions/applicationRecords.js';

const { initialiseMissingApplicationRecords } = initApplicationRecords(firebase, db, auth);

const main = async () => {
  return initialiseMissingApplicationRecords({
    exerciseId: 'RWQnJPnzBoRvviG0JVzy',
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
