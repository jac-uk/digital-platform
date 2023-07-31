'use strict';

const { app, db } = require('./shared/admin.js');
// const { applyUpdates } = require('../functions/shared/helpers');

const main = async () => {
  const stats = {};
  const startDate = new Date(2022,7,1);
  const applications = await db.collection('applications').where('appliedAt', '>', startDate).select().get();
  stats.applications = applications.docs.length;
  const candidates = await db.collection('candidates').where('created', '>', startDate).select().get();
  stats.candidates = candidates.docs.length;
  const exercises = await db.collection('exercises').where('createdAt', '>', startDate).select().get();
  stats.exercises = exercises.docs.length;
  const qualifyingTests = await db.collection('qualifyingTests').where('startDate', '>=', startDate).where('status', '==', 'completed').select().get();
  stats.qualifyingTests = qualifyingTests.docs.length;
  const qualifyingTestResponses = await db.collection('qualifyingTestResponses').where('qualifyingTest.startDate', '>=', startDate).where('status', '==', 'completed').select().get();
  stats.qualifyingTestResponses = qualifyingTestResponses.docs.length;
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
