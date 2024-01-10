const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db, auth } = require('../shared/admin.js');
const { createZenhubIssue } = require('../actions/zenhub')(config, firebase, db, auth);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions.js');

module.exports = functions.region('europe-west2').https.onCall(async (bugReportId, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  // Validate @judicialappointments.gov.uk and @judicialappointments.digital
  const validEmailPattern = /@judicialappointments\.gov\.uk$|@judicialappointments\.digital$/;
  if (!validEmailPattern.test(context.auth.token.email)) {
    throw new functions.https.HttpsError('failed-precondition', 'The function is restricted to JAC Staff.');
  }
  return await createZenhubIssue(bugReportId);
});

