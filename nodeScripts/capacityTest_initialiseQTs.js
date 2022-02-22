
/**
 * Example local script
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript example.js
 *   ```
 */
 'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const action = require('../functions/actions/applications/applications')(config, firebase, db);
const { initialiseApplicationRecords } = require('../functions/actions/applicationRecords')(config, firebase, db);
const initialiseQualifyingTest = require('../functions/actions/qualifyingTests/initialiseQualifyingTest')(config, firebase, db);
const {getDocument, getDocuments, applyUpdates} = require('../functions/shared/helpers');
const { faker } = require('@faker-js/faker');

const getNowString = () => {
  // DD/MM/YY hh:mm:ss
  let date = new Date();
  let year = date.getFullYear(),
      month = (date.getMonth() + 1).toString(),
      formattedMonth = (month.length === 1) ? ('0' + month) : month,
      day = date.getDate().toString(),
      formattedDay = (day.length === 1) ? ('0' + day) : day,
      hour = date.getHours().toString(),
      formattedHour = (hour.length === 1) ? ('0' + hour) : hour,
      minute = date.getMinutes().toString(),
      formattedMinute = (minute.length === 1) ? ('0' + minute) : minute,
      second = date.getSeconds().toString(),
      formattedSecond = (second.length === 1) ? ('0' + second) : second;
  return formattedDay + '/' + formattedMonth + '/' + year + ' ' + formattedHour + ':' + formattedMinute + ':' + formattedSecond;
};

const main = async () => {

  const exerciseId = '8CIlAsDbtMfr2vnfjmYh';
  const qualifyingTestId = '1zm5Q3LSRbSLBFakRbJ2';
  const toGenerate = 200;
  const refPrefix = 'prefix3';
  const clearOldApplications = true;

  let documentsRef;
  let documents;
  let document;
  let commands = [];
  let recordCount;

  if (clearOldApplications) {

    console.info(`${getNowString()} - Fetching existing qualifying test responses...`);
    documentsRef = db.collection('qualifyingTestResponses').where('vacancy.id', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    console.info(`${getNowString()} - - Done. ${documents.length} record(s) found`);

    console.info(`${getNowString()} - Deleting existing qualifying test responses(s)...`);
    commands = documents.map((document) => {
      return { command: 'delete', ref: document.ref };
    });
    recordCount = await applyUpdates(db, commands);
    console.info(`${getNowString()} - - Done. ${recordCount ? recordCount : 0} record(s) affected`);

    console.info(`${getNowString()} - Checking number of QT response records...`);
    documentsRef = db.collection('qualifyingTestResponses').where('vacancy.id', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    console.info(`${getNowString()} - - Done. ${documents.length} record(s) found`);



    console.info(`${getNowString()} - Setting status of QT to 'approved'...`);
    document = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));
    commands.push({
      command: 'update',
      ref: document.ref,
      data: {
        status: 'approved',
        'counts': null,
      },
    });
    recordCount = await applyUpdates(db, commands);
    console.info(`${getNowString()} - - Done. ${recordCount ? recordCount : 0} record(s) affected`);



    console.info(`${getNowString()} - Fetching existing application records...`);
    documentsRef = db.collection('applicationRecords').where('exercise.id', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    console.info(`${getNowString()} - - Done. ${documents.length} record(s) found`);

    commands = documents.map((document) => {
      return { command: 'delete', ref: document.ref };
    });

    console.info(`${getNowString()} - Deleting existing application records...`);
    recordCount = await applyUpdates(db, commands);
    console.info(`${getNowString()} - - Done. ${recordCount ? recordCount : 0} record(s) affected`);



    console.info(`${getNowString()} - Updating exercise (to 'not initialised')...`);
    document = await getDocument(db.collection('exercises').doc(exerciseId));
    commands = [{
      command: 'update',
      ref: document.ref,
      data: {
        'applicationRecords.initialised': false,
      },
    }];

    recordCount = await applyUpdates(db, commands);
    console.info(`${getNowString()} - - Done. ${recordCount ? recordCount : 0} record(s) affected`);



    console.info(`${getNowString()} - Fetching existing applications...`);
    documentsRef = db.collection('applications').where('exerciseId', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    console.info(`${getNowString()} - - Done. ${documents.length} record(s) found`);

    commands = documents.map((document) => {
      return { command: 'delete', ref: document.ref };
    });

    console.info(`${getNowString()} - Deleting application(s)...`);
    recordCount = await applyUpdates(db, commands);
    console.info(`${getNowString()} - - Done. ${recordCount ? recordCount : 0} record(s) affected`);
 }

  const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
  const titles = ['Mr', 'Mrs', 'Ms', 'Dr'];

  documents = [];

  for(let i = 0; i < toGenerate; i++) {

    let data = {};

    data.appliedAt = Date.now();
    data.characterChecks = {status: 'not requested'},
    data.createdAt = Date.now();
    data.exerciseId = exercise.id;
    data.exerciseName = exercise.name;
    data.exerciseRef = exercise.referenceNumber;

    data.userId = 'RW9nHLejKQRzTb7QACC6cte1UJu2';

    const name = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    const reasonableAdjustments = !!(Math.random() > 0.5);

    data.personalDetails = {
      citizenship: 'uk',
      dateOfBirth: faker.date.between('1950-01-01', '1999-01-01'),
      email: faker.internet.email(),
      title: titles[Math.floor(Math.random() * titles.length)],
      ...name,
      fullName: name.firstName + ' ' + name.lastName,
      nationalInsuranceNumber: 'PP' + (Math.random() * 100000).toFixed(0).padStart(6, '0') + 'C',
      phone: faker.phone.phoneNumber(),
      reasonableAdjustments: reasonableAdjustments,
      reasonableAdjustmentDetails: reasonableAdjustments ? 'Some reasonable adjustment details...' : '',
      reasonableAdjustmentsDetails: null,
    };

    data.progress = {
      started: true,
      personalDetails: true,
    };

    data.status = 'applied';
    data.referenceNumber = exercise.referenceNumber + '-' + refPrefix + i;
    documents.push(data);
  }

  console.info(`${getNowString()} - Creating ${toGenerate} applications...`);
  await action.createApplications(documents);
  console.info(`${getNowString()} - - Done`);

  console.info(`${getNowString()} - Checking number of applications...`);
  documentsRef = db.collection('applications').where('exerciseId', '==', exerciseId);
  documents = await getDocuments(documentsRef);
  console.info(`${getNowString()} - - Done. ${documents.length} record(s) found`);



  console.info(`${getNowString()} - Initialising application records...`);
  await initialiseApplicationRecords({exerciseId: exerciseId});
  console.info(`${getNowString()} - - Done`);

  console.info(`${getNowString()} - Checking number of application records...`);
  documentsRef = db.collection('applicationRecords').where('exercise.id', '==', exerciseId);
  documents = await getDocuments(documentsRef);
  console.info(`${getNowString()} - - Done. ${documents.length} record(s) found`);



  console.info(`${getNowString()} - Initialising qualifying test...`);
  await initialiseQualifyingTest({qualifyingTestId: qualifyingTestId, stage: 'review', status: 'all'});
  console.info(`${getNowString()} - - Done`);

  console.info(`${getNowString()} - Checking number of QT response records...`);
  documentsRef = db.collection('qualifyingTestResponses').where('vacancy.id', '==', exerciseId);
  documents = await getDocuments(documentsRef);
  console.info(`${getNowString()} - - Done. ${documents.length} record(s) found`);



  console.info(`${getNowString()} - Activating qualifying test...`);
  await initialiseQualifyingTest({qualifyingTestId: qualifyingTestId});
  console.info(`${getNowString()} - - Done`);

};

console.info(`${getNowString()} - STARTED`);

main()
  .then(() => {
    app.delete();
    console.info(`${getNowString()} - FINISHED`);
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    console.info(`${getNowString()} - FINISHED`);
    process.exit();
  });
