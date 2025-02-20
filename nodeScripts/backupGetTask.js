'use strict';

import config from './shared/config.js';
import { app, firebase, db } from './shared/admin.js';
import { getDocument, getDocuments } from '../functions/shared/helpers.js';
import initBackupAuthentication from '../functions/actions/backup/authentication.js';
import { promises as fs } from 'fs'; // Import fs.promises
import path from 'path';
import initUpdateTask from '../functions/actions/tasks/updateTask.js';

const { getCompleteTask } = initUpdateTask(config, firebase, db);
async function saveExerciseAsJson(exerciseData) {

  try {
      await fs.writeFile('./backup-get-complete-task.json', JSON.stringify(exerciseData, null, 2));
      console.log('Exercise data saved');
  } catch (err) {
      console.error('Error saving exercise data:', err);
  }
}


async function backupTask() {
  const exerciseId = 'cEe3G1EdDwyFZjUdKgA2';
  const exercise = await getDocument(db.collection('exercises').doc(`${exerciseId}`));
  const task = await getDocument(db.collection('exercises').doc(`${exerciseId}/tasks/situationalJudgement`));

  const taskData = await getCompleteTask(exercise, task);

  await db.collection('exercises').doc(`${exerciseId}/tasks/qualifyingTest`).set(taskData);

  console.log(taskData);
  await saveExerciseAsJson(taskData);
  return taskData;  

}
const main = async () => {
  return backupTask();
};

main()
  .then((result) => {
    //console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
