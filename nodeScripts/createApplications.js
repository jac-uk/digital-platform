
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
const {getDocument} = require('../functions/shared/helpers');
const faker = require('faker')

 const main = async () => {
   const exerciseId = '8CIlAsDbtMfr2vnfjmYh';
   const toGenerate = 1000;
   const refPrefix = 'prefix2';
   
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

    const name = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    }
    const reasonableAdjustments = !!(Math.random() > 0.5);
    data.personalDetails = {
      citizenship: 'uk',
      dateOfBirth: faker.date.between('1950-01-01', '1999-01-01'),
      email: faker.internet.email(),
      ...name,
      fullName: name.firstName + ' ' + name.lastName,
      nationalInsuranceNumber: 'PP' + (Math.random() * 100000).toFixed(0).padStart(6, '0') + 'C',
      phone: faker.phone.phoneNumber(),
      reasonableAdjustments,
      reasonableAdjustmentDetails: reasonableAdjustments ? 'Some reasonable adjustment details...' : '',
      title: titles[Math.floor(Math.random() * titles.length)],
    };
    data.progress = {
      started: true,
      personalDetails: true,
    }
    data.status = 'applied';
    data.referenceNumber = exercise.referenceNumber + '-' + refPrefix + i;
    documents.push(data);
   }
   return action.createApplications(documents);
 };
 
 main()
 .then((result) => {
   console.log('Result', result);
   app.delete();
   return process.exit();
 })
 .catch((error) => {
   console.error(error);
   process.exit();
 });
 