
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
const { firebase, app, db } = require('./shared/admin.js');
const { initialisePanelExport } = require('../functions/actions/panels/initialisePanelExport')(config, firebase, db);

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
