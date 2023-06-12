'use strict';

// const config = require('./shared/config.js');
const { app, db } = require('./shared/admin.js');
const { getDocuments } = require('../functions/shared/helpers.js');


const main = async () => {

  const exerciseId = 'vLoaJc4CdFShPYBNAXGy';


  // PLAN:
  // [x] get all applications
  // [x] for each application get `selectionCriteriaAnswers` array and return first element `.answerDetails`
  // [] return as a CSV with the following columns: App ID, Ref number, Candidate Name, Status, ASC value

  // get all applications
  const applications = await getDocuments(
    db.collection('applications')
    .where('exerciseId', '==', exerciseId)
    .where('status', '==', 'applied')
  );

  // for each application get `selectionCriteriaAnswers` array and return first element `.answerDetails`
  const filteredData = [];
  applications.forEach(application => {
    if (application._processing && application._processing.status === 'passedFirstTest') {
      const row = {
        referenceNumber: application.referenceNumber,
        fullName: application.personalDetails.fullName,
        asc: application.selectionCriteriaAnswers && application.selectionCriteriaAnswers[0] ? application.selectionCriteriaAnswers[0].answerDetails : '',
      };
      filteredData.push(row);
    }
  });

  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const headers = [
    { id: 'referenceNumber', title: 'Ref' },
    { id: 'fullName', title: 'Name' },
    { id: 'asc', title: 'ASC' },
  ];
  const output = createCsvWriter({
    path: 'output.csv',
    header: headers,
  });
  await output.writeRecords(filteredData);

  return filteredData.length;
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
