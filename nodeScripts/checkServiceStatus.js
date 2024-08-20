'use strict';

import { app, db } from './shared/admin.js';
import initServiceSettings from '../functions/shared/serviceSettings.js';

const { checkFunctionEnabled } = initServiceSettings(db);

const main = async () => {
  await checkFunctionEnabled();
  return;
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
