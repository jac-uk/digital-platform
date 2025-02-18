import { onSchedule } from 'firebase-functions/v2/scheduler';
import initCloseExercises from '../actions/exercises/closeExercises.js';

const { closeExercises } = initCloseExercises(db);

const SCHEDULE = 'every day 23:30';

export default onSchedule(
  {
    schedule: SCHEDULE, // Runs every day at 23:00 UTC (11:00 PM)
    region: 'europe-west2',
    timeZone: 'Europe/London',
    memory: '256MiB', // Adjust as needed
    timeoutSeconds: 540, // Maximum timeout for long-running tasks
  },
  async (event) => {
    return await closeExercises();
  }
);
