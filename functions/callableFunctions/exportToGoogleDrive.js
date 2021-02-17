const functions = require('firebase-functions');
const { checkArguments } = require('../shared/helpers.js');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { exportToGoogleDrive } = require('../actions/exercises/exportToGoogleDrive')(config, firebase, db);

const runtimeOptions = {
  timeoutSeconds: 540,
  memory: '1GB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  if (!checkArguments({
    driveId: { required: true },
    rootFolderId: { required: true },
    exerciseId: { required: true },
    panelId: { required: false },
    excludedApplicationIds: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  const result = await exportToGoogleDrive(data.driveId, data.rootFolderId, data.exerciseId, data.panelId, data.excludedApplicationIds);
  return result;
});
