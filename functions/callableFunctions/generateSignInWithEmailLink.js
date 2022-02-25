const functions = require('firebase-functions');
const { auth, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const users = require('../actions/users')(auth, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!checkArguments({
    ref: { required: true },
    email: { required: true },
    returnUrl: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await users.generateSignInWithEmailLink(data.ref, data.email, data.returnUrl);
  return {
    result: result,
  };
});
