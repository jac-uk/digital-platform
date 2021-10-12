'use strict';

const { app, db } = require('./shared/admin.js');
const { getDocuments } = require('../functions/shared/helpers');

const main = async () => {
  const exerciseId = ''; // enter exercise id

  let applicationsCount = {
    draft: 0,
    applied: 0,
    withdrawn: 0,
  };
  const applications = await getDocuments(db.collection('applications')
    .where('exerciseId', '==', exerciseId)
    .select('status'));

  applications.forEach(a => {
    applicationsCount[a.status]++;
  });

  return applicationsCount;
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

