'use strict';

const config = require('./shared/config');
const { app, db } = require('./shared/admin.js');
const { exportExerciseData } = require('../functions/actions/exercises/exportExerciseData')(config, db);

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
