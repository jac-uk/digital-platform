'use strict';

import { app, firebase } from './shared/admin.js';
import initBackupFirestore from '../functions/actions/backup/firestore.js';

const { backupFirestore } = initBackupFirestore(firebase);

const main = async () => {
  return backupFirestore();
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
