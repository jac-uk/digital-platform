
/**
 * Example local script
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript example.js
 *   ```
 */
'use strict';

import { app, auth } from './shared/firebase.js';

const main = async () => {
  // login as test user
  await auth.signInWithEmailAndPassword();
  return true;
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
