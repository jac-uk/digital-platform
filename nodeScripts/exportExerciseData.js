'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { exportExerciseData } = require('../functions/actions/exercises/exportExerciseData')(config, firebase, db);

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
