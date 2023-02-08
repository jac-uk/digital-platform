'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { generateDiversityData } = require('../functions/actions/exercises/generateDiversityData')(firebase, db);

const main = async () => {
  return generateDiversityData('1qef6rsaSLvvsZHrJuw7');
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
