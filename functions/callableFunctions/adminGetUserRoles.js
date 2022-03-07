const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin.js');
const  { adminGetUserRoles } = require('../actions/userRoles')(db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

const runtimeOptions = {
  memory: '256MB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  //TODO: add role check here
  return await adminGetUserRoles();

});

