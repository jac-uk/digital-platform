
/**
 * Example local script
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript example.js
 *   ```
 */
 'use strict';

import { firebase, app, db, auth } from './shared/admin.js';
import initApplications from '../functions/actions/applications/applications.js';
import { getDocument, getDocuments, applyUpdates } from '../functions/shared/helpers.js';
import { faker } from '@faker-js/faker';

const action = initApplications(firebase, db, auth);

const main = async () => {

  const exerciseId = '8CIlAsDbtMfr2vnfjmYh';
  const toGenerate = 10000;
  const refPrefix = 'prefix3';
  const clearOldApplications = true;

  if (clearOldApplications) {
    let applicationsRef = db.collection('applications')
      .where('exerciseId', '==', exerciseId);

    console.info(`${new Date().toLocaleTimeString()} - Fetching existing applications...`);
    const applications = await getDocuments(applicationsRef);
    console.info(`${new Date().toLocaleTimeString()} - - Done`);

    let commands = [];
    for (let i = 0; i < applications.length; i++) {
      commands.push({
        command: 'delete',
        ref: applications[i].ref,
      });
    }

    console.info(`${new Date().toLocaleTimeString()} - Deleting ${commands.length} existing application(s)...`);
    await applyUpdates(db, commands);
    console.info(`${new Date().toLocaleTimeString()} - - Done`);
 }

  const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
  const titles = ['Mr', 'Mrs', 'Ms', 'Dr'];

  const documents = [];

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

  console.info(`${new Date().toLocaleTimeString()} - Creating ${toGenerate} application(s)...`);
  await action.createApplications(documents);
  console.info(`${new Date().toLocaleTimeString()} - - Done`);

  console.info(`${new Date().toLocaleTimeString()} - Checking number of application(s)...`);
  let applicationsRef = db.collection('applications')
      .where('exerciseId', '==', exerciseId);
  const applications = await getDocuments(applicationsRef);
  console.info(`${new Date().toLocaleTimeString()} - - ${applications.length}`);

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
