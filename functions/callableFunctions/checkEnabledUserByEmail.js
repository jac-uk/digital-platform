const functions = require('firebase-functions');
const { auth, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const  checkEnabledUserByEmail  = require('../actions/candidates/checkEnabledUserByEmail.js')(auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  if (!checkArguments({
    email: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  return await checkEnabledUserByEmail(data);
});
