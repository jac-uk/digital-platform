import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import initExercisesOnUpdate from '../actions/exercises/onUpdate.js';

const onUpdate = initExercisesOnUpdate(config, firebase, db, auth);

export default functions.region('europe-west2').firestore
  .document('exercises/{exerciseId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    const exerciseId = context.params.exerciseId;
    onUpdate(exerciseId, before, after);
    return true;
  });
