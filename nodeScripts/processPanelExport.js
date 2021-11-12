
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
const { processPanelExport } = require('../functions/actions/panels/processPanelExport');

const main = async () => {
  await processPanelExport('25GTawkJ0ic1XLYKG29B');
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
