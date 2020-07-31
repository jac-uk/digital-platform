
/**
 * Example local script
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript example.js
 *   ```
 */
'use strict';

const { app, db, auth } = require('./shared/firebase.js');
const action = require('../functions/actions/testApplicationSubmission')(auth, db);

const main = async () => {
  // login as test user
  await auth.signInWithEmailAndPassword(process.env.AUTHENTICATED_USER_EMAIL, process.env.AUTHENTICATED_USER_PASSWORD);
  return action();
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
