import functions from 'firebase-functions';
import initCloseExercises from '../actions/exercises/closeExercises.js';

const { closeExercises } = initCloseExercises(db);

const SCHEDULE = 'every day 23:30';

export default functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    return await closeExercises();
  });
