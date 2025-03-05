
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
import initNotifications from '../functions/actions/notifications.js';

const { processNotifications } = initNotifications(firebase, db);

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
