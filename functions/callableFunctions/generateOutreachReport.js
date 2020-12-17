const functions = require('firebase-functions');
const { firebase, db } = require('../shared/admin.js');
const { generateOutreachReport } = require('../actions/exercises/generateOutreachReport')(firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "exerciseId"');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  const result = await generateOutreachReport(data.exerciseId);
  return {
    result: result,
  };
});
