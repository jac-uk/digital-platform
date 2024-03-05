const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { updateApplicationRecordStageStatus } = require('../actions/applicationRecords/updateApplicationRecordStageStatus.js')(firebase, config, db);
const { checkArguments } = require('../shared/helpers.js');
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions.js');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
    PERMISSIONS.applicationRecords.permissions.canUpdateApplicationRecords.value,
  ]);

  // validate input parameters
  if (!checkArguments({
    exerciseId: { required: true },
    version: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  // return the requested data
  return await updateApplicationRecordStageStatus({
    exerciseId: data.exerciseId,
    version: data.version,
  });
});
