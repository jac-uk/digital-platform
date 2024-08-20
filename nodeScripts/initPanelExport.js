
/**
 * Example local script
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript example.js
 *   ```
 */
'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initInitialisePanelExport from '../functions/actions/panels/initialisePanelExport.js';

const { initialisePanelExport } = initInitialisePanelExport(config, firebase, db);

const main = async () => {
  await initialisePanelExport('ozUWQ7ewwnA0RZOZ8nIP');
};

main()
  .then((result) => {
    console.log('Result', result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
