const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db, auth } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const { sendCharacterCheckRequests } = require('../actions/applications/applications')(config, firebase, db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    items: { required: true },
    type: { required: true },
    exerciseMailbox: { required: true },
    exerciseManagerName: { required: true },
    dueDate: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return await sendCharacterCheckRequests(data);
});
