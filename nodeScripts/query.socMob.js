'use strict';

// one query for id which exercises are impacts (opened after 1 arpil) ✅
// for one exercise get applied apps and look at e+Dsurvey answers.

// which missing new Q

// const config = require('./shared/config.js');
const { app, db } = require('./shared/admin.js');
// const { getDocuments, getAllDocuments, formatDate } = require('../functions/shared/helpers');
const { getDocuments } = require('../functions/shared/helpers');

const main = async () => {

  // get data
  const exercises = await getDocuments(
    db.collection('exercises')
    .where('applicationOpenDate', '>=', new Date('2023-04-01') )
    .where('applicationOpenDate', '<', new Date())
    .select('referenceNumber', 'applicationOpenDate', 'applicationCloseDate')
  );
    
  const exerciseIds = exercises.map(ex => ex.id);

  const allApplications = await getDocuments(
    db.collection('applications')
    .where('exerciseId', 'in', exerciseIds)
    .where('status', '==', 'applied')
    .select('referenceNumber', 'equalityAndDiversitySurvey', 'personalDetails', 'appliedAt', 'exerciseId')
  );

  // console.log(allApplications[0].equalityAndDiversitySurvey.hasOwnProperty('occupationOfChildhoodEarner'));

  const applicationsWithoutNewQuestions = allApplications.filter(application => {
    if  (!application.hasOwnProperty('equalityAndDiversitySurvey')) { return true; }
    if  (application.equalityAndDiversitySurvey.hasOwnProperty('occupationOfChildhoodEarner')) { return false; }
    if  (application.equalityAndDiversitySurvey.hasOwnProperty('stateOrFeeSchool16')) { return false; }
    if  (application.equalityAndDiversitySurvey.hasOwnProperty('parentsAttendedUniversity')) { return false; }
    return true;
  });

  const exerciseSummary = {};

  exercises.forEach((exercise) => {
    exerciseSummary[exercise.id] = {
      appliedCount: 0,
      impactedCount: 0,
    };
  });

  allApplications.forEach((application) => {
    exerciseSummary[application.exerciseId].appliedCount++;
  });

  applicationsWithoutNewQuestions.forEach((application) => {
    exerciseSummary[application.exerciseId].impactedCount++;
  });

  const rows = exercises.map((exercise) => {
    return {
      'referenceNumber': exercise.referenceNumber,
      'appliedCount': exerciseSummary[exercise.id].appliedCount,
      'impactedCount': exerciseSummary[exercise.id].impactedCount,
      'applicationOpenDate': exercise.applicationOpenDate.toDate().toLocaleString(),
      'applicationCloseDate': exercise.applicationCloseDate.toDate().toLocaleString(),
    };
  });

  // const rows = applicationsWithoutNewQuestions.map((application) => {
  //   return {
  //     'id': application.id,
  //     'referenceNumber': application.referenceNumber,
  //     'fullName': application.personalDetails.fullName,
  //     'email': application.personalDetails.email,
  //     'appliedAt': application.appliedAt.toDate().toISOString(),
  //   };
  // });

  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const headers = [
    // { id: 'id', title: 'Id' },
    // { id: 'referenceNumber', title: 'Ref' },
    // { id: 'fullName', title: 'Name' },
    // { id: 'email', title: 'Email' },
    // { id: 'appliedAt', title: 'Applied At' },
    { id: 'referenceNumber', title: 'Exercise Ref' },
    { id: 'applicationOpenDate', title: 'Open Date' },
    { id: 'applicationCloseDate', title: 'Close Date' },
    { id: 'appliedCount', title: 'Applied Applications' },
    { id: 'impactedCount', title: 'Impacted Applications' },
  ];
  const output = createCsvWriter({
    path: 'output.csv',
    header: headers,
  });
  await output.writeRecords(rows);

  // console.log('all applications ', allApplications.length);
  // console.log('without new Q applications ', applicationsWithoutNewQuestions.length);

  // return 'unaffected ' + (allApplications.length - applicationsWithoutNewQuestions.length);
  return exerciseSummary;
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
