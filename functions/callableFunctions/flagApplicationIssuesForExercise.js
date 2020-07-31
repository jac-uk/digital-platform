const functions = require('firebase-functions');
const { db } = require('../shared/admin.js');
const flagApplicationIssues = require('../actions/applications/flagApplicationIssues')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }
  // @TODO check auth.token for correct role, when we have implemented roles
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  const result = await flagApplicationIssues.flagApplicationIssuesForExercise(data.exerciseId);
  return {
    result: result,
  };
});
