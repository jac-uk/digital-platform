'use strict';

import { firebase, app, db } from './shared/admin.js';
import initExportApplicationContactsData from '../functions/actions/exercises/exportApplicationContactsData.js';

const { exportApplicationContactsData } = initExportApplicationContactsData(firebase, db);

const main = async () => {
  return exportApplicationContactsData({
    exerciseId: 'nJrIBstsDNMDs6VAxDUf',
    status: 'applied',
    processingStage: 'selected',
    //processingStatus: '',
  });
};

main()
  .then((result) => {
    console.log(result.headers);
    console.log(result.rows[0]);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
