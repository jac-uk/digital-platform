'use strict';

// const config = require('./shared/config.js');
const { app, db } = require('./shared/admin.js');
const { getDocuments } = require('../functions/shared/helpers');


const main = async () => {

  // get data
  let ref = db.collection('assessments')
    .where('status', '==', 'pending')
    .select('exercise.referenceNumber', 'application.referenceNumber', 'assessor.email');
  const documents = await getDocuments(ref);


  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: 'file.csv',
    header: [
      { id: 'exerciseRef', title: 'Exercise Ref' },
      { id: 'applicationRef', title: 'Application Ref' },
      { id: 'assessorEmail', title: 'Assessor email' },
    ],
  });

  let data = documents.filter(doc => {
    if (doc.assessor.email.indexOf(' ') >= 0) {
      return true;
    }
  });

  await csvWriter.writeRecords(data.map(item => {
    return {
      exerciseRef: item.exercise.referenceNumber,
      applicationRef: item.application.referenceNumber,
      assessorEmail: `|${item.assessor.email}|`,
    };
  }));

  return true;
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
