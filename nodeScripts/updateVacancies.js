/*
 * This script is used to update all vacancies in the `vacancies` collection in firestore.
 *
 */

'use strict';

import { app, db } from './shared/admin.js';
import initVacancies from '../functions/actions/vacancies.js';
import { getDocuments } from '../functions/shared/helpers.js';

const { updateVacancy } = initVacancies(db);
const isAction = false;

const main = async () => {
  const exercises = await getDocuments(db.collection('exercises'));

  console.log('exercises', exercises.length);
  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    if (isAction) {
      await updateVacancy(exercise.id, exercise);
      console.log(`[${i + 1}/${exercises.length}] ${exercise.id} updated`);
    } else {
      console.log(`[${i + 1}/${exercises.length}] ${exercise.id} skipped`);
    }
  }
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
