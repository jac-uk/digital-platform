const functions = require('firebase-functions');
const  { adminGetUsers } = require('../actions/userRoles')();

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  //TODO: add role check here
  return await adminGetUsers();

});

