'use strict';

const config = require('./shared/config');
const { app, firebase, db } = require('./shared/admin.js');
const emptyExerciseQualifyingTests = require('../functions/actions/exercises/emptyExerciseQualifyingTests')(config, firebase, db);

const main = async () => {
  return emptyExerciseQualifyingTests({
    exerciseId: 'wdpALbyICL7ZxxN5AQt8',
  });
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
