'use strict';

import config from './shared/config.js';
import { firebase, app, auth, db } from './shared/admin.js';
import initGetMultipleApplicationData from '../functions/actions/exercises/getMultipleApplicationData.js';

// Initialize getApplicationData with config, firebase, db, and auth
const getMultipleApplicationData = initGetMultipleApplicationData(config, firebase, db, auth);

// Define the list of exerciseIds to retrieve data for
const exerciseIds = ['XvzIg48K9XOhfeFr3w91', 'Biyjd07Xz2usL9yXjtjV', 'IKLcf2Y187f2WTjifsoj'];  

// Params for each call to getApplicationData
const columns = ['exerciseRef','referenceNumber','personalDetails.fullName','status'];

const main = async () => {
  return getMultipleApplicationData(exerciseIds, columns);
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