/* 
 * This script queries the database and returns the number of applications and application records, and statuses.
 *
 */

'use strict';

import { app, db } from './shared/admin.js';

const main = async () => {
  const stats = {
    applications: {},
    applicationRecords: {},
    status: {},
  };

  const applications = await db.collection('applications').select('status', 'userId').get();
  stats.applications.total = applications.docs.length;
  applications.docs.forEach(doc => {
    const application = doc.data();
    if (stats.applications[application.status]) {
      stats.applications[application.status]++;
    } else {
      stats.applications[application.status] = 1;
    }
  });

  const applicationRecords = await db.collection('applicationRecords').select('stage', 'status', 'candidate').get();
  stats.applicationRecords.total = applicationRecords.docs.length;
  applicationRecords.docs.forEach(doc => {
    const applicationRecord = doc.data();
    if (stats.applicationRecords[applicationRecord.stage]) {
      stats.applicationRecords[applicationRecord.stage]++;
    } else {
      stats.applicationRecords[applicationRecord.stage] = 1;
    }
    if (stats.status[applicationRecord.status]) {
      stats.status[applicationRecord.status]++;
    } else {
      stats.status[applicationRecord.status] = 1;
    }
  });

  return stats;
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
