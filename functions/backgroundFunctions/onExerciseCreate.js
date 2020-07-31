const functions = require('firebase-functions');

module.exports = functions.region('europe-west2').firestore
  .document('exercises/{exerciseId}')
  .onCreate((snap, context) => {
    const exerciseId = context.params.exerciseId;
    console.log(`Exercise created (${exerciseId})`);
  });
