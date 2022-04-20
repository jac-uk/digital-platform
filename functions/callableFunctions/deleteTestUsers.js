const functions = require('firebase-functions');
const { firebase, db, auth } = require('../shared/admin.js');
const config = require('../shared/config');
const { loadTestApplications } = require('../actions/applications/applications')(config, firebase, db, auth);
const { deleteUsers } = require('../actions/users')(auth, db);
const { isProduction } = require('../shared/helpers');

const runtimeOptions = {
  memory: '512MB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
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

  let uids = [];
  for (let i = 0; i < data.noOfTestUsers; i++) {
    const application = testApplications[i];
    uids.push(application.userId);
  }

  return await deleteUsers(uids);
});
