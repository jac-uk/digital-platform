
/**
 * Example local script
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript temp/getExercisesByTaskTypes.js
 *   ```
 */
 'use strict';

const config = require('../shared/config.js');
const { firebase, app, db, auth } = require('../shared/admin.js');
const {getDocuments, objectHasNestedProperty} = require('../../functions/shared/helpers.js');

const { sendPublishedFeedbackReportNotifications } = require('../../functions/actions/applications/applications')(config, firebase, db, auth);


const main = async () => {

  const tester = await sendPublishedFeedbackReportNotifications('m3vtltvjqdpUZTdMBWKT', 'scenarioTest');

  console.log(`tester: ${tester}`);

  // const results = {};
  // let typesToRetrieve = [
  //   config.TASK_TYPE.CRITICAL_ANALYSIS,
  //   config.TASK_TYPE.QUALIFYING_TEST,
  //   config.TASK_TYPE.SCENARIO,
  //   config.TASK_TYPE.SITUATIONAL_JUDGEMENT,
  // ];

  // let exercisesRef = db.collection('exercises');
  // const exercises = await getDocuments(exercisesRef);
  // for (let i = 0; i < exercises.length; i++) {
  //   if (typesToRetrieve.length === 0) {
  //     console.log('Found all of them!');
  //     console.log('results:');
  //     console.log(results);
  //     return true;
  //   }
  //   const exercise = exercises[i];

  //   const testFlag = objectHasNestedProperty(exercise, 'tasks');
  //   const exerciseId = exercise.id;
  //   console.log(`exercise id: ${exerciseId}`);
  //   if (testFlag) {
  //     console.log('--has tasks');
  //   }

  //   const taskRef = db.collection(`exercises/${exerciseId}/tasks`);
  //   const tasks = await getDocuments(taskRef);

  //   if (tasks.length > 0) {
  //     //console.log('TASKS EXIST!!');

  //     for (let j = 0; j < tasks.length; j++) {
  //       const task = tasks[j];
  //       //console.log(`task type: ${task.type}`);

  //       if (typesToRetrieve.includes(task.type)) {

  //         console.log(`MATCH ON: ${task.type}`);

  //         results[`id-${task.type}-${exerciseId}`] = task;

  //         const index = typesToRetrieve.indexOf(task.type);
  //         if (index !== -1) {
  //           typesToRetrieve.splice(index, 1);
  //         }
  //       }
  //     }
  //   }
  // }

  // console.log('Didnt find all of them!');
  // console.log('results:');
  // console.log(results);
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
