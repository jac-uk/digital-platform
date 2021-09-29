'use strict';

const { app, db } = require('./shared/admin.js');
// const { applyUpdates } = require('../functions/shared/helpers');

const main = async () => {
  const exerciseId = 'Yt04PxbBde5nfZxNgFWx';

  const stats = {
    applications: {},
    applicationRecords: {},
  };

  const applications = await db.collection('applications').where('exerciseId', '==', exerciseId).select('status').get();
  stats.applications.total = applications.docs.length;
  applications.docs.forEach(doc => {
    const application = doc.data();
    if (stats.applications[application.status]) {
      stats.applications[application.status]++;
    } else {
      stats.applications[application.status] = 1;
    }
  });

  const applicationRecords = await db.collection('applicationRecords').where('exercise.id', '==', exerciseId).select('stage').get();
  stats.applicationRecords.total = applicationRecords.docs.length;
  applicationRecords.docs.forEach(doc => {
    const applicationRecord = doc.data();
    if (stats.applicationRecords[applicationRecord.stage]) {
      stats.applicationRecords[applicationRecord.stage]++;
    } else {
      stats.applicationRecords[applicationRecord.stage] = 1;
    }
  });

  const applicationIds = applications.docs.map(doc => doc.id);
  const applicationRecordIds = applicationRecords.docs.map(doc => doc.id);
  const appliedApplicationIds = applications.docs.filter(doc => doc.data().status === 'applied').map(doc => doc.id);

  stats.orphanedApplications = applicationIds.filter(id => applicationRecordIds.indexOf(id) < 0).length;
  stats.orphanedApplicationRecords = applicationRecordIds.filter(id => applicationIds.indexOf(id) < 0).length;
  stats.orphanedAppliedApplicationIds = appliedApplicationIds.filter(id => applicationRecordIds.indexOf(id) < 0).length;  // remove `.length` to get IDs

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
