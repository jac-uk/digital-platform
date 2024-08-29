'use strict';

import config from './shared/config.js';
import { firebase, app, auth, db } from './shared/admin.js';
import initGetApplicationData from '../functions/actions/exercises/getApplicationData.js';

const getApplicationData = initGetApplicationData(config, firebase, db, auth);

// const params = {
//   // columns: ['personalDetails.title'],
//   columns: ['additionalWorkingPreferences 5'],
//   exerciseId: 'zIpZ7DWHfk0b6uLUes4O',
//   type: 'showdata',
//   whereClauses: [],
// };  

// const params = {
//   exerciseId: 'zIpZ7DWHfk0b6uLUes4O',
//   type: 'showdata',
//   whereClauses: [],
// };  

const params = {
  exerciseId: 'Z2r71rLLFI2m8zOXV3Ev',
  columns: [
    'referenceNumber',
    'personalDetails.dateOfBirth'
  ],
  stage: null,
  stageStatus: null,
  type: "showData",
  whereClauses: [],
  statuses: [],
};

const main = async () => {
  //return getApplicationData(params);

  const result = await getApplicationData(params);
  console.log('getApplicationData:');
  console.log(result);

};

main()
  .then((result) => {
    //console.log(result.length);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
