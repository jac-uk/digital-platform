/*
 * This script updates diversity reports for all exercises that have more than 1 application record.
 */

'use strict';

import { firebase, app, db } from './shared/admin.js';
import { getDocuments } from '../functions/shared/helpers.js';
import initGenerateDiversityReport from '../functions/actions/exercises/generateDiversityReport.js';

const { generateDiversityReport } = initGenerateDiversityReport(firebase, db);

const main = async () => {
  let exercisesRef = db.collection('exercises')
    .where('_applicationRecords._total', '>', 0)
    .select('id');

  console.info(`${new Date().toLocaleTimeString()} - Fetching existing exercises...`);
  const exercises = await getDocuments(exercisesRef);
  console.info(`${new Date().toLocaleTimeString()} - - Done (Found ${exercises.length} exercises)`);

  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    console.info(`${new Date().toLocaleTimeString()} - [${i + 1}/${exercises.length}] Processing exercise ${exercise.id} ...`);
    try {
      await generateDiversityReport(exercise.id);
      console.info(`${new Date().toLocaleTimeString()} - - Done`);
    } catch (error) {
      console.info(`${new Date().toLocaleTimeString()} - - Error: ${error}`);
    }
  }
};

main()
  .then((result) => {
    console.table(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
