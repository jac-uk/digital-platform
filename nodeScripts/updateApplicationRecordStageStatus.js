/*
 * This script is used to migrate applicationRecord stage and status for a specific exercise.
 */

'use strict';

import { firebase, app, db } from './shared/admin.js';
import initUpdateApplicationRecordStageStatus from '../functions/actions/applicationRecords/updateApplicationRecordStageStatus.js';

const { updateApplicationRecordStageStatus } = initUpdateApplicationRecordStageStatus(firebase, db);

// whether to make changes in firestore

const main = async () => {

  updateApplicationRecordStageStatus(null);
  return true;
};

// function calculateStats(stage, status, stats) {
//   if (stats.stage[stage]) {
//     stats.stage[stage]++;
//   } else {
//     stats.stage[stage] = 1;
//   }
//   if (stats.status[status]) {
//     stats.status[status]++;
//   } else {
//     stats.status[status] = 1;
//   }
// }

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
