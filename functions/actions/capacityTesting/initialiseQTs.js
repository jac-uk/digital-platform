const config = require('../../shared/config');
const { firebase, db } = require('../../shared/admin');
const action = require('../applications/applications')(config, firebase, db);
const { initialiseApplicationRecords } = require('../applicationRecords')(config, firebase, db);
const initialiseQualifyingTest = require('../qualifyingTests/initialiseQualifyingTest')(config, firebase, db);
const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');
const { faker } = require('@faker-js/faker');


module.exports = (db) => {
  return {
    initialiseQTs,
  };

  /**
   * Initialise qualifying tests
   * 
   * @param {*} `params` is an object containing
   *   `exerciseId` (required) ID of exercise
   *   `qualifyingTestId` (required) ID of qualifying test
   *   `noOfCandidates` (required) number of candidates
   *   `refPrefix` (required) reference prefix
   *   `userId` (required) ID of user
   *
   * @return
   */
  async function initialiseQTs(params) {
    const { exerciseId, qualifyingTestId, noOfCandidates, refPrefix, userId } = params;
    const toGenerate = noOfCandidates;
    const clearOldApplications = true;

    let documentsRef;
    let documents;
    let document;
    let commands = [];
    let recordCount;

    // response data
    let prevNoOfQualifyingTestResponses = 0;
    let prevNoOfAffectedQualifyingTestResponses = 0;
    let noOfApplications = 0;
    let noOfApplicationRecords = 0;
    let noOfQualifyingTestResponses = 0;

    if (clearOldApplications) {
      // fetch existing qualifying test responses
      documentsRef = db.collection('qualifyingTestResponses').where('vacancy.id', '==', exerciseId);
      documents = await getDocuments(documentsRef);
      prevNoOfQualifyingTestResponses = documents.length;
      
      // delete existing qualifying test responses(s)
      commands = documents.map((document) => {
        return { command: 'delete', ref: document.ref };
      });
      recordCount = await applyUpdates(db, commands);
      prevNoOfAffectedQualifyingTestResponses = recordCount ? recordCount : 0;

      // set status of QT to 'approved'
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

      // fetch existing application records
      documentsRef = db.collection('applicationRecords').where('exercise.id', '==', exerciseId);
      documents = await getDocuments(documentsRef);
      commands = documents.map((document) => {
        return { command: 'delete', ref: document.ref };
      });

      // delete existing application records
      recordCount = await applyUpdates(db, commands);

      // update exercise (to 'not initialised')
      document = await getDocument(db.collection('exercises').doc(exerciseId));
      commands = [{
        command: 'update',
        ref: document.ref,
        data: {
          'applicationRecords.initialised': false,
        },
      }];
      recordCount = await applyUpdates(db, commands);

      // fetch existing applications
      documentsRef = db.collection('applications').where('exerciseId', '==', exerciseId);
      documents = await getDocuments(documentsRef);
      commands = documents.map((document) => {
        return { command: 'delete', ref: document.ref };
      });

      // delete application(s)
      recordCount = await applyUpdates(db, commands);
    }


    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    const titles = ['Mr', 'Mrs', 'Ms', 'Dr'];
    documents = [];
    for (let i = 0; i < toGenerate; i++) {
      let data = {};
      data.appliedAt = Date.now();
      data.characterChecks = { status: 'not requested' },
      data.createdAt = Date.now();
      data.exerciseId = exercise.id;
      data.exerciseName = exercise.name;
      data.exerciseRef = exercise.referenceNumber;
      data.userId = userId;

      const name = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };
      const reasonableAdjustments = Boolean(Math.random() > 0.5);

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

    // create applications
    await action.createApplications(documents);

    // check number of applications
    documentsRef = db.collection('applications').where('exerciseId', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    noOfApplications = documents.length;


    // initialise application records
    await initialiseApplicationRecords({exerciseId: exerciseId});

    // check number of application records
    documentsRef = db.collection('applicationRecords').where('exercise.id', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    noOfApplicationRecords = documents.length;


    // initialise qualifying test
    await initialiseQualifyingTest({ qualifyingTestId: qualifyingTestId, stage: 'review', status: 'all' });

    // check number of QT response records
    documentsRef = db.collection('qualifyingTestResponses').where('vacancy.id', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    noOfQualifyingTestResponses = documents.length;

    // activate qualifying test
    await initialiseQualifyingTest({ qualifyingTestId: qualifyingTestId });

    return {
      prevNoOfQualifyingTestResponses,
      prevNoOfAffectedQualifyingTestResponses,
      noOfApplications,
      noOfApplicationRecords,
      noOfQualifyingTestResponses,
    };
  }

};
