'use strict';

import { app, db } from './shared/admin.js';
import initExportExerciseData from '../functions/actions/exercises/exportExerciseData.js';

const { exportExerciseData } = initExportExerciseData(db);

const main = async () => {
  return exportExerciseData(['FTEkY12izilXtn6sP3cK']);
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
