
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
  await auth.signInWithEmailAndPassword(process.env.AUTHENTICATED_USER_EMAIL, process.env.AUTHENTICATED_USER_PASSWORD);
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
