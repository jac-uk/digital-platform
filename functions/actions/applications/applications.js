const { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } = require('constants');
const { getAllDocuments, applyUpdates, getDocument, getDocuments } = require('../../shared/helpers');

const testApplicationsFileName = 'test_applications.json';

module.exports = (config, firebase, db, auth) => {
  const { initialiseApplicationRecords } = require('../../actions/applicationRecords')(config, firebase, db, auth);
  const { refreshApplicationCounts } = require('../../actions/exercises/refreshApplicationCounts')(firebase, db);
  const { newNotificationApplicationSubmit, newNotificationCharacterCheckRequest, newNotificationSensitiveFlagConfirmation } = require('../../shared/factories')(config);
  const slack = require('../../shared/slack')(config);
  const { updateCandidate } = require('../candidates/search')(firebase, db);
  return {
    updateApplication,
    onApplicationCreate,
    sendApplicationConfirmation,
    sendCharacterCheckRequests,
    createApplication,
    createApplications,
    loadTestApplications,
    createTestApplications,
    deleteApplications,
    sendSensitiveFlagConfirmation,
  };

  /**
   * Update application document with the provided ID and data
   */
  async function updateApplication(applicationId, data) {
    try {
      await db.collection('applications').doc(applicationId).set(data, { merge: true });
      return true;
    } catch (e) {
      console.error(`Error writing application ${applicationId}`, e);
      return false;
    }
  }

  /**
   * Create Multiple Application Records
   *
   * @param {array} data
   */
  async function createApplications(documents) {
    let commands = [];
    for(let i = 0; i < documents.length; i++) {
      commands.push({
        command: 'set',
        ref: db.collection('applications').doc(),
        data: documents[i],
      });
    }
    return await applyUpdates(db, commands);
  }

  /**
   *
   * Create an application document
   *
   * @param {*} data
   */
  async function createApplication(data) {
    try {
      return db.collection('applications').add(data);
    } catch(e) {
      console.error(`Error Adding Document: ${e}`);
      return false;
    }
  }

  /**
   * Application created event handler
   * - Posts message to slack
   * - Increment exercise applications count
   */
  async function onApplicationCreate(ref, data) {
    console.log('application created');
    // slack.post(`${data.exerciseRef}. New application started`);
    if (data.userId) { await updateCandidate(data.userId); }
    // update counts
    console.log(`Update application counts: _applications.${data.status}`);
    const saveData = {};
    saveData[`_applications.${data.status}`] = firebase.firestore.FieldValue.increment(1);
    saveData['_applications._total'] = firebase.firestore.FieldValue.increment(1);
    saveData['_applications._lastUpdated'] = firebase.firestore.FieldValue.serverTimestamp();
    await db.doc(`exercises/${data.exerciseId}`).update(saveData);
    console.log('success');
  }

  /**
  * sendApplicationConfirmation
  * Sends a 'application submitted' notification for each application
  * @param {*} `params` is an object containing
  *   `applicationId`  (required) ID of application
  *   `application`    (required) application
  */
   async function sendApplicationConfirmation(params) {
    const applicationId = params.applicationId;
    const application = params.application;
    const applicationRef = db.collection('applications').doc(applicationId);

    // get exercise
    const exerciseId = application.exerciseId;
    const exercise = await getDocument(db.doc(`exercises/${exerciseId}`));
    if (!exercise) return false;

    // create database commands
    const commands = [];
    // create notification
    commands.push({
      command: 'set',
      ref: db.collection('notifications').doc(),
      data: newNotificationApplicationSubmit(firebase, applicationId, application, exercise),
    });
    // update application
    commands.push({
      command: 'update',
      ref: applicationRef,
      data: {
        'emailLog.applicationSubmitted': firebase.firestore.Timestamp.fromDate(new Date()),
      },
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? true : false;
  }

  /**
  * sendCharacterCheckRequests
  * Sends a 'request for character check' notification for each application
  * @param {*} `params` is an object containing
  *   `items` (required) IDs of applications
  */
  async function sendCharacterCheckRequests(params) {
    const applicationIds = params.items;
    const type = params.type;
    const exerciseMailbox = params.exerciseMailbox;
    const exerciseManagerName = params.exerciseManagerName;
    const dueDate = params.dueDate;
    // get applications
    const applicationRefs = applicationIds.map(id => db.collection('applications').doc(id));
    const applications = await getAllDocuments(db, applicationRefs);

    // create database commands
    const commands = [];
    for (let i = 0, len = applications.length; i < len; ++i) {
      const application = applications[i];
      // create notification
      commands.push({
        command: 'set',
        ref: db.collection('notifications').doc(),
        data: newNotificationCharacterCheckRequest(firebase, application, type, exerciseMailbox, exerciseManagerName, dueDate),
      });
      // update application
      if (type === 'request') {
        commands.push({
          command: 'update',
          ref: application.ref,
          data: {
            'characterChecks.requestedAt': firebase.firestore.Timestamp.fromDate(new Date()),
            'characterChecks.status': 'requested',
          },
        });
      } else if (type === 'reminder') {
        commands.push({
          command: 'update',
          ref: application.ref,
          data: {
            'characterChecks.reminderSentAt': firebase.firestore.Timestamp.fromDate(new Date()),
          },
        });
      } else if (type === 'submit') {
        commands.push({
          command: 'update',
          ref: application.ref,
          data: {
            'emailLog.characterCheckSubmitted': firebase.firestore.Timestamp.fromDate(new Date()),
          },
        });
      }
    }

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applications.length : false;
  }

  /**
    * load test applications JSON file from cloud storage
    */
  async function loadTestApplications() {
    const bucket = firebase.storage().bucket(config.STORAGE_URL);
    const file = bucket.file(testApplicationsFileName);

    try {
      const data = await file.download();
      return JSON.parse(data[0]);
    } catch (error) {
      return false;
    }
  }

  /**
   * Create test applications
   *
   * @param {string} exerciseId
   * @param {number} noOfTestApplications
   * @param {array} testApplications
   *
   * @return {object}
   *
   */
  async function createTestApplications(data) {
    const { exerciseId, noOfTestApplications, testApplications } = data;

    // format test applications with exercise information
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    const applications = [];
    const users = [];

    for (let i = 0; i < noOfTestApplications; i++) {
      let application = testApplications[i];
      application.appliedAt = Date.now();
      application.characterChecks = { status: 'not requested' },
      application.createdAt = Date.now();
      application.exerciseId = exercise.id;
      application.exerciseName = exercise.name;
      application.exerciseRef = exercise.referenceNumber;
      application.referenceNumber = `${exercise.referenceNumber}-${application.referenceNumber.split('-')[1]}`;
      applications.push(application);

      users.push({
        uid: application.userId,
        email: application.personalDetails.email,
      });
    }

    // create applications
    let resCreateApplications = await createApplications(applications);

    // initialise application records
    initialiseApplicationRecords({ exerciseId: exercise.id });

    return {
      exerciseId,
      noOfTestApplications: applications.length,
      noOfCreatedTestApplications: resCreateApplications ? resCreateApplications : null,
    };
  }

  /**
   * Delete applications
   *
   * @param {string} exerciseId
   *
   * @return {object}
   */
   async function deleteApplications(exerciseId) {
    let documentsRef;
    let documents;
    let document;
    let commands = [];
    let recordCount;

    let noOfDeletedApplications = 0;
    let noOfDeletedApplicationRecords = 0;

    // fetch existing application records
    documentsRef = db.collection('applicationRecords').where('exercise.id', '==', exerciseId);
    documents = await getDocuments(documentsRef);
    commands = documents.map((document) => {
      return { command: 'delete', ref: document.ref };
    });

    // delete existing application records
    recordCount = await applyUpdates(db, commands);
    noOfDeletedApplicationRecords = recordCount ? recordCount : 0;

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
    noOfDeletedApplications = recordCount ? recordCount : 0;

    await refreshApplicationCounts({ exerciseId });

    return {
      noOfDeletedApplications,
      noOfDeletedApplicationRecords,
    };
  }

  /**
  * sendSensitiveFlagConfirmation
  * Sends a 'sensitive flagged confirmation' notification for each application
  * @param {*} `params` is an object containing
  *   `applicationId`  (required) ID of application
  *   `application`    (required) application
  */
   async function sendSensitiveFlagConfirmation(params) {
    const applicationId = params.applicationId;
    const application = params.application;
    const applicationRef = db.collection('applications').doc(applicationId);

    // get exercise
    const exerciseId = application.exerciseId;
    const exercise = await getDocument(db.doc(`exercises/${exerciseId}`));
    if (!exercise) return false;

    // create database commands
    const commands = [];
    // create notification
    commands.push({
      command: 'set',
      ref: db.collection('notifications').doc(),
      data: newNotificationSensitiveFlagConfirmation(firebase, applicationId, application, exercise),
    });
    // update application
    commands.push({
      command: 'update',
      ref: applicationRef,
      data: {
        'emailLog.sensitivityFlagged': firebase.firestore.Timestamp.fromDate(new Date()),
      },
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? true : false;
  }
};
