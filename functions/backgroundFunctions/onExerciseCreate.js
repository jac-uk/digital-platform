import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db } from '../shared/admin.js';
import initExercisesOnCreate from '../actions/exercises/onCreate.js';

const onCreate = initExercisesOnCreate(db);

export default onDocumentCreated('exercises/{exerciseId}', async (event) => {
  const snap = event.data;
  const exerciseId = event.params.exerciseId;
  console.log(`Exercise created (${exerciseId})`);
  const snapData = snap.data();
  const name = snapData.name;
  const referenceNumber = snapData.referenceNumber;
  onCreate(exerciseId, name, referenceNumber);
  return true;
});
