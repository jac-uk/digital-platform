'use strict';

const { app, db } = require('./shared/admin.js');
// const { applyUpdates } = require('../functions/shared/helpers');

const main = async () => {
  const stats = {};
  // const applications = await db.collection('applications').get();
  // stats.applications = applications.docs.length;
  // const candidates = await db.collection('candidates').get();
  // stats.candidates = candidates.docs.length;
  // const exercises = await db.collection('exercises').get();
  // stats.exercises = exercises.docs.length;
  const applications = await db.collection('applications').where('exerciseId', '==', 'wdpALbyICL7ZxxN5AQt8').get();
  stats.applications = applications.docs.length;
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
