'use strict';

import { app, db } from './shared/admin.js';
import initGetApplicationData from '../functions/actions/exercises/getApplicationData.js';

const getApplicationData = initGetApplicationData(db);

const params = {
  // columns: ['personalDetails.title'],
  columns: ['additionalWorkingPreferences 5'],
  exerciseId: 'zIpZ7DWHfk0b6uLUes4O',
  type: 'showdata',
  whereClauses: [],
};  

// const params = {
//   exerciseId: 'zIpZ7DWHfk0b6uLUes4O',
//   type: 'showdata',
//   whereClauses: [],
// };  

const main = async () => {
  return getApplicationData(params);
};

main()
  .then((result) => {
    console.log(result.length);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
