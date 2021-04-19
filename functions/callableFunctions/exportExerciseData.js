const functions = require('firebase-functions');
const { checkArguments } = require('../shared/helpers.js');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { exportExerciseData } = require('../actions/exercises/exportExerciseData')(config, firebase, db);
const { getAllDocuments } = require('../shared/helpers');
const { logEvent } = require('../actions/logs/logEvent')(firebase, db);

const runtimeOptions = {
  timeoutSeconds: 300,
  memory: '1GB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').https.onCall(async (data, context) => {

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!checkArguments({
    exerciseIds: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  // generate the export
  const result = await exportExerciseData(data.exerciseIds);

  // log an event
  const exerciseRefs = data.exerciseIds.map(id => db.collection('exercises').doc(id));
  const exercises = await getAllDocuments(db, exerciseRefs);
  let details = {
    exercises: [],
  };
  exercises.forEach(exercise => {
    details.exercises.push({
      exerciseId: exercise.id,
      exerciseRef: exercise.referenceNumber,
    });
  });
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Exercises exported', details, user);

  // return the report to the caller
  return result;
});
