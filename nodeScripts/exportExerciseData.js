'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { exportExerciseData } = require('../functions/actions/exercises/exportExerciseData')(config, firebase, db);

const main = async () => {
  return exportExerciseData(['wdpALbyICL7ZxxN5AQt8','wdpALbyICL7ZxxN5AQt8']);
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
