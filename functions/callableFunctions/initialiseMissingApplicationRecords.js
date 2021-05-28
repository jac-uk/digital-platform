const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const { initialiseMissingApplicationRecords } = require('../actions/applicationRecords')(config, firebase, db);
const { generateDiversityReport } = require('../actions/exercises/generateDiversityReport')(firebase, db);
// const { flagApplicationIssuesForExercise } = require('../actions/applications/flagApplicationIssues')(config, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    exerciseId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await initialiseMissingApplicationRecords(data);

  // once we have application records we can generate reports
  await generateDiversityReport(data.exerciseId);  // @TODO use pub/sub instead?
  // await flagApplicationIssuesForExercise(data.exerciseId);

  return result;
});
