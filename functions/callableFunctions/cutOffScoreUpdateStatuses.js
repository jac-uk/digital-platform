const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const cutOffScoreQualifyingTest = require('../actions/qualifyingTests/cutOffScoreQualifyingTest')(config, firebase, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

const runtimeOptions = {
  memory: '256MB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
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
