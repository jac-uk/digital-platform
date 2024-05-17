const functions = require('firebase-functions');
const config = require('../shared/config');
const { db, auth } = require('../shared/admin');
const onUpdate = require('../actions/exercises/onUpdate')(config, db, auth);

module.exports = functions.region('europe-west2').firestore
  .document('exercises/{exerciseId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    const exerciseId = context.params.exerciseId;
    onUpdate(exerciseId, before, after);
    return true;
  });
