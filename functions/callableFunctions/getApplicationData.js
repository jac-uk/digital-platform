const functions = require('firebase-functions');
const { auth } = require('../shared/admin.js');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const { getApplicationData } = require('../actions/exercises/getApplicationData')(config, firebase, db, auth);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  // if (!checkArguments({
  //   exerciseId: { required: true },
  // }, data)) {
  //   throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  // }
  return getApplicationData(data);
});
