const functions = require('firebase-functions');
const { auth, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const updateEmailAddress = require('../actions/candidates/updateEmailAddress')(auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const config = require('../shared/config');
const { wrapFunction } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').https.onCall(wrapFunction(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    currentEmailAddress: { required: true },
    newEmailAddress: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await updateEmailAddress(data);

}));
