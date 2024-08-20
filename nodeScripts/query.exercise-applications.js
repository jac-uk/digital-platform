'use strict';

import { app, db } from './shared/admin.js';

const main = async () => {
  const exerciseId = 'QVu4QWN6h8G1BDvXLUaG';

  const stats = {
    applications: {},
    applicationRecords: {},
    status: {},
  };

  const applications = await db.collection('applications').where('exerciseId', '==', exerciseId).select('status', 'userId').get();
  stats.applications.total = applications.docs.length;
  applications.docs.forEach(doc => {
    const application = doc.data();
    if (stats.applications[application.status]) {
      stats.applications[application.status]++;
    } else {
      stats.applications[application.status] = 1;
    }
  });

  const applicationRecords = await db.collection('applicationRecords').where('exercise.id', '==', exerciseId).select('stage', 'status', 'candidate').get();
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

  const appliedCandidateIds = applications.docs.filter(doc => doc.data().status === 'applied').map(doc => doc.data().userId);
  const applicationRecordCandidateIds = applicationRecords.docs.map(doc => {
    const data = doc.data();
    return data.candidate ? data.candidate.id : 0;
  });
  console.log('applied candidates', appliedCandidateIds.length);
  console.log('candidates being processed', applicationRecordCandidateIds.length);
  const unique = applicationRecordCandidateIds
    .map((id) => {
      return {
        count: 1,
        id: id,
      };
    })
    .reduce((a, b) => {
      a[b.id] = (a[b.id] || 0) + b.count;
      return a;
    }, {});

  // console.log('unique', unique);
  const duplicates = Object.keys(unique).filter((key) => unique[key] > 1);
  console.log('duplicates', duplicates);

  const candidatesWithoutApplications = applicationRecordCandidateIds.filter(id => appliedCandidateIds.indexOf(id) < 0);
  console.log('candidatesWithoutApplications', candidatesWithoutApplications.length);
  const withdrawnCandidates = applicationRecords.docs.filter(doc => doc.data().status === 'withdrewApplication').map(doc => {
    const data = doc.data();
    return data.candidate ? data.candidate.id : 0;
  });
  console.log('withdrawnCandidates', withdrawnCandidates.length);
  const candidatesWithoutApplicationsNotWithdrawn = candidatesWithoutApplications.filter(id => withdrawnCandidates.indexOf(id) < 0);
  console.log('candidatesWithoutApplicationsNotWithdrawn', candidatesWithoutApplicationsNotWithdrawn.length);
  const applicationRecordsWithoutApplicationsNotWithdrawn = applicationRecords.docs.filter(doc => candidatesWithoutApplicationsNotWithdrawn.indexOf(doc.data().candidate.id) >= 0).map(doc => { return { fullName: doc.data().candidate.fullName, id: doc.id }; });
  console.log('applicationRecordsWithoutApplicationsNotWithdrawn', applicationRecordsWithoutApplicationsNotWithdrawn);

  stats.candidatesWithoutApplications = candidatesWithoutApplications.length;

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
