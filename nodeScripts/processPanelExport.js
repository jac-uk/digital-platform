
/**
 * Example local script
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript example.js
 *   ```
 */
'use strict';

const config = require('./shared/config');
const { app, db, storage } = require('./shared/admin.js');
const { processPanelExport } = require('../functions/actions/panels/processPanelExport')(config, db, storage);

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
