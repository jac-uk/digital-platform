const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const { testAssessmentNotification } = require('../actions/assessments')(config, firebase, db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    assessmentId: { required: true },
    notificationType: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  const result = await testAssessmentNotification({
    assessmentId: data.assessmentId,
    notificationType: data.notificationType,
    email: context.auth.token.email,
  });
  return {
    result: result,
  };
});
