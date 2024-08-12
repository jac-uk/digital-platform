'use strict';

import config from './shared/config.js';
import { app, firebase } from './shared/admin.js';
import initBackupAuthentication from '../functions/actions/backup/authentication.js';

const { backupAuthentication } = initBackupAuthentication(config, firebase);

const main = async () => {
  return backupAuthentication();
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
