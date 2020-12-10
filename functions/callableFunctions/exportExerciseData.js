const functions = require('firebase-functions');
const { checkArguments } = require('../shared/helpers.js');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { exportExerciseData } = require('../actions/exercises/exportExerciseData')(config, firebase, db);

const runtimeOptions = {
  timeoutSeconds: 300,
  memory: '1GB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {
  if (!checkArguments({
    exerciseIds: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  const result = await exportExerciseData(data.exerciseIds);
  return result;
});
