const functions = require('firebase-functions');

const runtimeOptions = {
  memory: '256MB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').firestore
  .document('exercises/{exerciseId}')
  .onCreate((snap, context) => {
    const exerciseId = context.params.exerciseId;
    console.log(`Exercise created (${exerciseId})`);
  });
