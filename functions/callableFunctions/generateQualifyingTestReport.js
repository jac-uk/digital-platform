const functions = require('firebase-functions');
const { checkArguments } = require('../shared/helpers.js');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { generateQualifyingTestReport } = require('../actions/qualifyingTests/generateQualifyingTestReport')(config, firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!checkArguments({
    qualifyingTestReportId: { required: true }
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  const result = await generateQualifyingTestReport(data.qualifyingTestReportId);
  return result;
});
