'use strict';

import config from './shared/config.js';
import { app, firebase, db } from './shared/admin.js';
import { getDocument, getDocuments } from '../functions/shared/helpers.js';
import initBackupAuthentication from '../functions/actions/backup/authentication.js';
import { promises as fs } from 'fs'; // Import fs.promises
import path from 'path';
async function saveExerciseAsJson(exerciseData) {

  try {
      await fs.writeFile('./task-backup.json', JSON.stringify(exerciseData, null, 2));
      console.log('Exercise data saved');
  } catch (err) {
      console.error('Error saving exercise data:', err);
  }
}


async function backupTask() {
  const exerciseId = 'cEe3G1EdDwyFZjUdKgA2';
  const task = await getDocument(db.collection('exercises').doc(`${exerciseId}/tasks/qualifyingTest`));
  console.log(task);
  await saveExerciseAsJson(task);
  return task;  

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
