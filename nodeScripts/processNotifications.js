
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
const { processNotifications } = require('../functions/actions/notifications')(config, firebase, db);

const main = async () => {
  await processNotifications();
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
