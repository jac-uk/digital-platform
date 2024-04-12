const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { updateApplicationRecordStageStatus } = require('../actions/applicationRecords/updateApplicationRecordStageStatus.js')(firebase, config, db);
const { checkArguments } = require('../shared/helpers.js');
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions.js');
const { generateDiversityReport } = require('../actions/exercises/generateDiversityReport')(config, firebase, db);
const { generateDiversityData } = require('../actions/exercises/generateDiversityData')(firebase, db);
const { generateOutreachReport } = require('../actions/exercises/generateOutreachReport')(config, firebase, db);

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

  const result = await updateApplicationRecordStageStatus({
    exerciseId: data.exerciseId,
    version: data.version,
  });

  // refresh reports
  await generateDiversityReport(data.exerciseId);
  await generateDiversityData(data.exerciseId);
  await generateOutreachReport(data.exerciseId);

  // return the requested data
  return result;
});
