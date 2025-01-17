import * as functions from 'firebase-functions/v1';
import { firebase, db, auth } from '../shared/admin.js';
import config from '../shared/config.js';
import initApplications from '../actions/applications/applications.js';
import initUsers from '../actions/users.js';
import { isProduction } from '../shared/helpers.js';

const { loadTestApplications } = initApplications(config, firebase, db, auth);
const { importUsers } = initUsers(auth, db);

const runtimeOptions = {
  memory: '512MB',
};
// default hashed password
const defaultPasswordBcryptHash = '$2a$12$y/eoSrLp1c147c4VjCT/l.f/hxxraGhQYIYKYycZVdqh61pvPXjOW';

export default functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  // do not use this function on production
  if (isProduction()) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must not be called on production.');
  }

  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  if (!(typeof data.noOfTestUsers === 'number')) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify a number of test users');
  }

  const testApplications = await loadTestApplications();
  if (!testApplications) {
    throw new functions.https.HttpsError('failed-precondition', `Failed to load test applications from cloud storage (${fileName}).`);
  }

  const maxNoOfTestApplications = testApplications.length;
  if (data.noOfTestUsers < 1 || data.noOfTestUsers > maxNoOfTestApplications) {
    throw new functions.https.HttpsError('invalid-argument', 'The number of test applications should be between 1 and ' + maxNoOfTestApplications);
  }

  const passwordBcryptHash = data.passwordBcryptHash ? data.passwordBcryptHash : defaultPasswordBcryptHash;
  let userImportRecords = [];
  for (let i = 0; i < data.noOfTestUsers; i++) {
    const application = testApplications[i];
    userImportRecords.push({
      uid: application.userId,
      email: application.personalDetails.email,
      passwordHash: Buffer.from(passwordBcryptHash),
    });
  }

  return await importUsers(userImportRecords);
});
