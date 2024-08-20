'use strict';

import { firebase, app, db } from './shared/admin.js';
import initGenerateDiversityData from '../functions/actions/exercises/generateDiversityData.js';

const { generateDiversityData } = initGenerateDiversityData(firebase, db);

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
