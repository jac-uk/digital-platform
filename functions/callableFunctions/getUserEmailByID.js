const functions = require('firebase-functions');
const { auth } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const  getUserEmailByID  = require('../actions/candidates/getUserEmailByID')(auth);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  console.log('getUserByID called');
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    candidateId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await getUserEmailByID(data);

});
