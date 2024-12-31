import functions from 'firebase-functions';
import { db } from '../shared/admin.js';
import initExercisesOnCreate from '../actions/exercises/onCreate.js';

const onCreate = initExercisesOnCreate(db);

export default functions.region('europe-west2').firestore
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
