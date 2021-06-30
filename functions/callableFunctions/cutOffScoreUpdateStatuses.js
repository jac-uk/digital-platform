const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const cutOffScoreQualifyingTest = require('../actions/qualifyingTests/cutOffScoreQualifyingTest')(config, firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    applicationIds: { required: true },
    cutOffScore: { required: true },
    cutOffPassStatus: { required: true },
    cutOffFailStatus: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return cutOffScoreQualifyingTest(data);
});
