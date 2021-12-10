const functions = require('firebase-functions');
const { auth } = require('../shared/admin.js');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { customReport } = require('../actions/exercises/customReport')(config, firebase, db, auth);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  return customReport(data, context);
});
