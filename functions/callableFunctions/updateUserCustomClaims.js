const functions = require('firebase-functions');
const { auth, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const { updateUserCustomClaims } = require('../actions/users.js')(auth, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    userId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await updateUserCustomClaims(data.userId);

});
