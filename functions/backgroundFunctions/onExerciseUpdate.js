import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { firebase, db } from '../shared/admin.js';
import initExercisesOnUpdate from '../actions/exercises/onUpdate.js';

const onUpdate = initExercisesOnUpdate(firebase, db);

export default onDocumentUpdated(
  {
    document: 'exercises/{exerciseId}',
    memory: '512MiB', // Specify memory allocation
  },
  async (event) => {
  const after = event.data.after.data();
  const before = event.data.before.data();
  const exerciseId = event.params.exerciseId;
  onUpdate(exerciseId, before, after);
  return true;
});
