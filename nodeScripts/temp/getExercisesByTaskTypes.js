
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
const { app, db } = require('../shared/admin.js');
const {getDocuments, objectHasNestedProperty} = require('../../functions/shared/helpers.js');

const main = async () => {

  const results = {};

  // If the task types below dont work then do a string search for TASK_TYPE and search based on those values in config
  /*
    lookup[`${TASK_TYPE.CRITICAL_ANALYSIS}`] = 'Critical Analysis Test';
    lookup[`${TASK_TYPE.SITUATIONAL_JUDGEMENT}`] = 'Situational Judgement Test';
    lookup[`${TASK_TYPE.QUALIFYING_TEST}`] = 'QT Merit List';
    lookup[`${TASK_TYPE.SCENARIO}`] = 'Scenario Test';

    TASK_TYPE.CRITICAL_ANALYSIS
    TASK_TYPE.SITUATIONAL_JUDGEMENT
    TASK_TYPE.QUALIFYING_TEST
    TASK_TYPE.SCENARIO
  */
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
    const id = exercise.id;
    console.log(`exercise id: ${id}`);
    if (testFlag) {
      console.log('--has tasks');
    }

    // if (id === 'Sap4j0n7pZEQVADuRVkt') {
    //   //console.log('============ SHOULD HAVE TASKS (============');
    //   //console.log(Object.keys(exercise).sort().slice(-20));
    //   //console.log(exercise.tasks);

    //   //const taskRef = db.doc(`exercises/${id}/tasks/${params.type}`);
      
    //   // const taskRef = db.doc(`exercises/${id}/tasks`);
    //   // const tasks = await getDocument(taskRef);

    //   const taskRef = db.collection(`exercises/${id}/tasks`);
    //   const tasks = await getDocuments(taskRef);

    //   if (tasks.length > 0) {
    //     console.log('TASKS EXIST!!');

    //     for (let j = 0; j < tasks.length; j++) {
    //       const task = tasks[j];
    //       console.log(`task type: ${task.type}`);

    //       if (typesToRetrieve.includes(task.type)) {
    //         const index = typesToRetrieve.indexOf(task.type);
    //         if (index !== -1) {
    //           typesToRetrieve.splice(index, 1);
    //         }
    //       }
    //     }
    //   }
    // }

    const taskRef = db.collection(`exercises/${id}/tasks`);
    const tasks = await getDocuments(taskRef);

    if (tasks.length > 0) {
      //console.log('TASKS EXIST!!');

      for (let j = 0; j < tasks.length; j++) {
        const task = tasks[j];
        //console.log(`task type: ${task.type}`);

        if (typesToRetrieve.includes(task.type)) {

          console.log(`MATCH ON: ${task.type}`);

          results[`id-${task.type}`] = task;

          const index = typesToRetrieve.indexOf(task.type);
          if (index !== -1) {
            typesToRetrieve.splice(index, 1);
          }
        }
      }
    }

    // for (let j=0; j<typesToRetrieve.length; ++j) {
    //   const typeToRetrieve = typesToRetrieve[j];
    //   if (objectHasNestedProperty(exercise, `tasks.${typeToRetrieve}`)) {
    //     results[typeToRetrieve] = exercise.id;

    //     // Find and remove item from array
    //     var index = typesToRetrieve.indexOf(typeToRetrieve);
    //     if (index !== -1) {
    //       typesToRetrieve.splice(index, 1);
    //     }
    //   }
    // }
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
