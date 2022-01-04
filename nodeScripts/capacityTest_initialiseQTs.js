
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
const faker = require('faker');

const main = async () => {

  const exerciseId = '8CIlAsDbtMfr2vnfjmYh';
  const qualifyingTestId = '1zm5Q3LSRbSLBFakRbJ2';
  const toGenerate = 1000;
  const refPrefix = 'prefix3';
  const clearOldApplications = true;

  let documentsRef;
  let documents;
  let document;
  let commands = [];
  let recordCount;

  if (clearOldApplications) {

    console.info(`${new Date().toLocaleTimeString()} - Fetching existing qualifying test responses...`);
    documentsRef = db.collection('qualifyingTestResponses').where('vacancy.id', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    console.info(`${new Date().toLocaleTimeString()} - - Done. ${documents.length} record(s) found`);

    console.info(`${new Date().toLocaleTimeString()} - Deleting existing qualifying test responses(s)...`);
    commands = documents.map((document) => {
      return { command: 'delete', ref: document.ref };
    });
    recordCount = await applyUpdates(db, commands);
    console.info(`${new Date().toLocaleTimeString()} - - Done. ${recordCount ? recordCount : 0} record(s) affected`);

    console.info(`${new Date().toLocaleTimeString()} - Checking number of QT response records...`);
    documentsRef = db.collection('qualifyingTestResponses').where('vacancy.id', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    console.info(`${new Date().toLocaleTimeString()} - - Done. ${documents.length} record(s) found`);



    console.info(`${new Date().toLocaleTimeString()} - Setting status of QT to 'approved'...`);
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
    console.info(`${new Date().toLocaleTimeString()} - - Done. ${recordCount ? recordCount : 0} record(s) affected`);



    console.info(`${new Date().toLocaleTimeString()} - Fetching existing application records...`);
    documentsRef = db.collection('applicationRecords').where('exercise.id', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    console.info(`${new Date().toLocaleTimeString()} - - Done. ${documents.length} record(s) found`);

    commands = documents.map((document) => {
      return { command: 'delete', ref: document.ref };
    });

    console.info(`${new Date().toLocaleTimeString()} - Deleting existing application records...`);
    recordCount = await applyUpdates(db, commands);
    console.info(`${new Date().toLocaleTimeString()} - - Done. ${recordCount ? recordCount : 0} record(s) affected`);



    console.info(`${new Date().toLocaleTimeString()} - Updating exercise (to 'not initialised')...`);
    document = await getDocument(db.collection('exercises').doc(exerciseId));
    commands = [{
      command: 'update',
      ref: document.ref,
      data: {
        'applicationRecords.initialised': false,
      },
    }];

    recordCount = await applyUpdates(db, commands);
    console.info(`${new Date().toLocaleTimeString()} - - Done. ${recordCount ? recordCount : 0} record(s) affected`);



    console.info(`${new Date().toLocaleTimeString()} - Fetching existing applications...`);
    documentsRef = db.collection('applications').where('exerciseId', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    console.info(`${new Date().toLocaleTimeString()} - - Done. ${documents.length} record(s) found`);

    commands = documents.map((document) => {
      return { command: 'delete', ref: document.ref };
    });

    console.info(`${new Date().toLocaleTimeString()} - Deleting application(s)...`);
    recordCount = await applyUpdates(db, commands);
    console.info(`${new Date().toLocaleTimeString()} - - Done. ${recordCount ? recordCount : 0} record(s) affected`);
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

  console.info(`${new Date().toLocaleTimeString()} - Creating ${toGenerate} applications...`);
  await action.createApplications(documents);
  console.info(`${new Date().toLocaleTimeString()} - - Done`);

  console.info(`${new Date().toLocaleTimeString()} - Checking number of applications...`);
  documentsRef = db.collection('applications').where('exerciseId', '==', exerciseId);
  documents = await getDocuments(documentsRef);
  console.info(`${new Date().toLocaleTimeString()} - - Done. ${documents.length} record(s) found`);



  console.info(`${new Date().toLocaleTimeString()} - Initialising application records...`);
  await initialiseApplicationRecords({exerciseId: exerciseId});
  console.info(`${new Date().toLocaleTimeString()} - - Done`);

  console.info(`${new Date().toLocaleTimeString()} - Checking number of application records...`);
  documentsRef = db.collection('applicationRecords').where('exercise.id', '==', exerciseId);
  documents = await getDocuments(documentsRef);
  console.info(`${new Date().toLocaleTimeString()} - - Done. ${documents.length} record(s) found`);



  console.info(`${new Date().toLocaleTimeString()} - Initialising qualifying test...`);
  await initialiseQualifyingTest({qualifyingTestId: qualifyingTestId, stage: 'review', status: 'all'});
  console.info(`${new Date().toLocaleTimeString()} - - Done`);

  console.info(`${new Date().toLocaleTimeString()} - Checking number of QT response records...`);
  documentsRef = db.collection('qualifyingTestResponses').where('vacancy.id', '==', exerciseId);
  documents = await getDocuments(documentsRef);
  console.info(`${new Date().toLocaleTimeString()} - - Done. ${documents.length} record(s) found`);

};

console.info(`${new Date().toLocaleTimeString()} - STARTED`);

main()
  .then(() => {
    app.delete();
    console.info(`${new Date().toLocaleTimeString()} - FINISHED`);
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    console.info(`${new Date().toLocaleTimeString()} - FINISHED`);
    process.exit();
  });
