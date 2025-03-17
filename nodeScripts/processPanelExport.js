
/**
 * Example local script
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript example.js
 *   ```
 */
'use strict';

import { firebase, app, db } from './shared/admin.js';
import initProcessPanelExport from '../functions/actions/panels/processPanelExport.js';
const { processPanelExport } = initProcessPanelExport(firebase, db);

const main = async () => {
  await processPanelExport('ozUWQ7ewwnA0RZOZ8nIP');
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
