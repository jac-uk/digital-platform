const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { createZenhubIssue } = require('../actions/zenhub')(config, firebase, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions.js');

module.exports = functions.region('europe-west2').https.onCall(async (bugReportId, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  hasPermissions(context.auth.token.rp, [PERMISSIONS.zenhub.permissions.canCreateZHIssues.value]);
  return await createZenhubIssue(bugReportId);
});

