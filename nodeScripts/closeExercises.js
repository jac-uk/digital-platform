'use strict';

const { app, db } = require('./shared/admin.js');
const { closeExercises } = require('../functions/actions/exercises/closeExercises')(db);

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
