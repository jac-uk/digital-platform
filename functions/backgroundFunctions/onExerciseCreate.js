const functions = require('firebase-functions');
const { db } = require('../shared/admin');
const onCreate = require('../actions/exercises/onCreate')(db);

module.exports = functions.region('europe-west2').firestore
  .document('exercises/{exerciseId}')
  .onCreate(async (snap, context) => {
    const exerciseId = context.params.exerciseId;
    console.log(`Exercise created (${exerciseId})`);
    const snapData = snap.data();
    const name = snapData.name;
    const referenceNumber = snapData.referenceNumber;
    onCreate(exerciseId, name, referenceNumber);
    return true;
  });
