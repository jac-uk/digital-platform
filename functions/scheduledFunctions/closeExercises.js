const functions = require('firebase-functions');
const { closeExercises } = require('../actions/exercises/closeExercises')(db);

const SCHEDULE = 'every day 23:30';

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    return await closeExercises();
  });
