const functions = require('firebase-functions');
const { auth, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const  getUserByEmail  = require('../actions/candidates/getUserByEmail')(auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  console.log('getUserByID called');
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    email: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await getUserByEmail(data);
});
