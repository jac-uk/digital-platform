
/**
 * Get a list of exercises with tasks that match the ones in the typesToRetrieve
 * This was used to help find exercises to use when testing the sendPublishedFeedbackReportNotifications function
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript temp/getExercisesByTaskTypes.js
 *   ```
 */
'use strict';

import config from '../shared/config.js';
import { app, db } from '../shared/admin.js';
import { getDocuments, objectHasNestedProperty } from '../../functions/shared/helpers.js';

const main = async () => {

  const results = {};
  let typesToRetrieve = [
    config.TASK_TYPE.CRITICAL_ANALYSIS,
    config.TASK_TYPE.QUALIFYING_TEST,
    config.TASK_TYPE.SCENARIO,
    config.TASK_TYPE.SITUATIONAL_JUDGEMENT,
  ];

  let exercisesRef = db.collection('exercises');
  const exercises = await getDocuments(exercisesRef);
  for (let i = 0; i < exercises.length; i++) {
    if (typesToRetrieve.length === 0) {
      console.log('Found all of them!');
      console.log('results:');
      console.log(results);
      return true;
    }
    const exercise = exercises[i];

    const testFlag = objectHasNestedProperty(exercise, 'tasks');
    const exerciseId = exercise.id;
    console.log(`exercise id: ${exerciseId}`);
    if (testFlag) {
      console.log('--has tasks');
    }

    const taskRef = db.collection(`exercises/${exerciseId}/tasks`);
    const tasks = await getDocuments(taskRef);

    if (tasks.length > 0) {

      for (let j = 0; j < tasks.length; j++) {
        const task = tasks[j];

        if (typesToRetrieve.includes(task.type)) {

          console.log(`MATCH ON: ${task.type}`);

          results[`id-${task.type}-${exerciseId}`] = task;

          const index = typesToRetrieve.indexOf(task.type);
          if (index !== -1) {
            typesToRetrieve.splice(index, 1);
          }
        }
      }
    }
  }

  console.log('Didnt find all of them!');
  console.log('results:');
  console.log(results);
  return true;

};

main()
  .then(() => {
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
