'use strict';

import { app, db } from './shared/admin.js';
import initCcloseExercises from '../functions/actions/exercises/closeExercises.js';

const { closeExercises } = initCcloseExercises(db);

const main = async () => {
  return closeExercises();
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
