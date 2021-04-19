const functions = require('firebase-functions');
const { checkArguments } = require('../shared/helpers.js');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { generateQualifyingTestReport } = require('../actions/qualifyingTests/generateQualifyingTestReport')(config, firebase, db);
const { getDocument } = require('../shared/helpers');
const { logEvent } = require('../actions/logs/logEvent')(firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!checkArguments({
    qualifyingTestReportId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  // generate the report
  const result = await generateQualifyingTestReport(data.qualifyingTestReportId);

  // log an event
  const qualifyingTestReport = await getDocument(db.collection('qualifyingTestReports').doc(data.qualifyingTestReportId));
  let details = {
    qualifyingTestReportId: qualifyingTestReport.id,
  };
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Qualifying test report generated', details, user);

  // return the report to the caller
  return result;
});
