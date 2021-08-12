const functions = require('firebase-functions');
const { checkArguments } = require('../shared/helpers.js');
const  { disableNewUser } = require('../actions/userRoles')();

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    uid: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  //TODO: add role check here
  return await disableNewUser(data);

});

