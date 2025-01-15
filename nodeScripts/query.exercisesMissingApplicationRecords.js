'use strict';

import { app, db } from './shared/admin.js';
import { getDocuments } from '../functions/shared/helpers.js';

async function getExerciseStats(exerciseId) {

  const stats = {
    applications: {},
    applicationRecords: {},
    status: {},
  };

  const applications = await getDocuments(db.collection('applications').where('exerciseId', '==', exerciseId).select('status', 'userId', 'referenceNumber'));
  stats.applications.total = applications.length;
  applications.forEach(application => {
    if (stats.applications[application.status]) {
      stats.applications[application.status]++;
    } else {
      stats.applications[application.status] = 1;
    }
  });

  const applicationRecords = await getDocuments(db.collection('applicationRecords').where('exercise.id', '==', exerciseId).select('stage', 'status', 'candidate'));
  stats.applicationRecords.total = applicationRecords.length;
  applicationRecords.forEach(applicationRecord => {
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


  const applicationIds = applications.map(doc => doc.id);
  const applicationRecordIds = applicationRecords.map(doc => doc.id);
  const appliedApplicationIds = applications.filter(doc => doc.status === 'applied').map(doc => doc.id);

  stats.orphanedApplications = applicationIds.filter(id => applicationRecordIds.indexOf(id) < 0).length;
  stats.orphanedApplicationRecords = applicationRecordIds.filter(id => applicationIds.indexOf(id) < 0).length;
  stats.orphanedAppliedApplicationIds = appliedApplicationIds.filter(id => applicationRecordIds.indexOf(id) < 0);
  stats.orphanedAppliedApplications = stats.orphanedAppliedApplicationIds.length;
  if (stats.orphanedAppliedApplications) {
    stats.orphanedAppliedApplicationReferenceNumbers = applications.filter(app => stats.orphanedAppliedApplicationIds.indexOf(app.id) >= 0).map(app => app.referenceNumber);
    stats.orphanedAppliedApplicationData = applications.filter(app => stats.orphanedAppliedApplicationIds.indexOf(app.id) >= 0);
  }

  const draftApplications = applications.filter(application => application.status === 'draft');
  const draftApplicationsBeingProcessed = draftApplications.filter(application => applicationRecordIds.indexOf(application.id) >= 0);
  stats.draftApplicationsBeingProcessed = draftApplicationsBeingProcessed; // .map(application => application.referenceNumber);

  return stats;
}

const main = async () => {

  const exercises = await getDocuments(
    db.collection('exercises')
      .where('applicationCloseDate', '<', new Date())
      //.where(firebase.firestore.FieldPath.documentId(), 'in', ['6PZQoZ46Wk3GdsqAIzAl'])
      .select('referenceNumber')
  );
  console.log('exercises', exercises.length);

  const arrExerciseStats = await Promise.all(exercises.map(async (exercise) => {
    return {
      exerciseId: exercise.id,
      stats: await getExerciseStats(exercise.id),
    };
  }));

  // return arrExerciseStats;
  // return arrExerciseStats.filter(report => report.stats.draftApplicationsBeingProcessed.length > 0).map(report => report.stats.draftApplicationsBeingProcessed.map(app => `${report.exerciseId}, ${app.id}, ${app.referenceNumber}`).join('\n')).join('\n');
  return arrExerciseStats.filter(report => report.stats.orphanedAppliedApplications > 0).map(report => report.stats.orphanedAppliedApplicationData.map(app => `${report.exerciseId}, ${app.id}, ${app.referenceNumber}`).join('\n')).join('\n');

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
