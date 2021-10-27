
/**
 * Example local script
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript example.js
 *   ```
 */
'use strict';

const { app } = require('./shared/firebase.js');
const { initialisePanelExport } = require('../functions/actions/panels/initialisePanelExport');

const main = async () => {
  await initialisePanelExport('25GTawkJ0ic1XLYKG29B');
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
