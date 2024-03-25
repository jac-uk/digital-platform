'use strict';

const { app, db } = require('./shared/admin.js');
// const { applyUpdates } = require('../functions/shared/helpers');

const main = async () => {
  const stats = {};
  const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
  const startDate = oneMonthAgo;
  const applications = await db.collection('applications').where('startDate', '>=', startDate).select().get();
  stats.applications = applications.docs.length;
  const candidates = await db.collection('candidates').where('startDate', '>=', startDate).select().get();
  stats.candidates = candidates.docs.length;
  const exercises = await db.collection('exercises').where('startDate', '>=', startDate).select().get();
  stats.exercises = exercises.docs.length;
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
