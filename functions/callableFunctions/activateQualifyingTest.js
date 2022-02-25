const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const { checkServiceStatus } = require('../shared/checkServiceStatus.js');
const activateQualifyingTest = require('../actions/qualifyingTests/activateQualifyingTest')(config, firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {

  if (checkServiceStatus()) {
    throw new functions.https.HttpsError('unavailable', 'This action is currently unavailable.');
  }

  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    qualifyingTestId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return activateQualifyingTest(data);

});
