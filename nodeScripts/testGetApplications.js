'use strict';

import config from './shared/config.js';
import { app, firebase, db } from './shared/admin.js';
import { getDocument, getDocuments } from '../functions/shared/helpers.js';
import initBackupAuthentication from '../functions/actions/backup/authentication.js';
import { promises as fs } from 'fs'; // Import fs.promises
import path from 'path';
import initUpdateTask from '../functions/actions/tasks/updateTask.js';

const { getApplications } = initUpdateTask(config, firebase, db);
async function saveExerciseAsJson(exerciseData) {

  try {
      await fs.writeFile('./getApplications.json', JSON.stringify(exerciseData, null, 2));
      console.log('Exercise data saved');
  } catch (err) {
      console.error('Error saving exercise data:', err);
  }
}


async function backupTask() {
  const exerciseId = 'pvP1C5XCCfPTZZNFAPGu';
  const exercise = await getDocument(db.collection('exercises').doc(`${exerciseId}`));
  //const task = await getDocument(db.collection('exercises').doc(`${exerciseId}/tasks/situationalJudgement`));
  const task = await getDocument(db.collection('exercises').doc(`${exerciseId}/tasks/criticalAnalysis`));

  const applications = await getApplications(exercise, task);

  //await db.collection('exercises').doc(`${exerciseId}/tasks/qualifyingTest`).set(taskData);

  //console.log(taskData);
  await saveExerciseAsJson(applications);
  return applications;  

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
