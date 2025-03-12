import { getAllDocuments, applyUpdates, getDocument, getDocuments } from '../../shared/helpers.js';
import { getSearchMap } from '../../shared/search.js';
import initApplicationRecords from '../../actions/applicationRecords.js';
import initRefreshApplicationCounts from '../../actions/exercises/refreshApplicationCounts.js';
import initFactories from '../../shared/factories.js';
// import initSlack from '../../shared/slack.js';
import initCandidatesSearch from '../candidates/search.js';

const testApplicationsFileName = 'test_applications.json';

export default (config, firebase, db, auth) => {
  const { initialiseApplicationRecords } = initApplicationRecords(config, firebase, db, auth);
  const { refreshApplicationCounts } = initRefreshApplicationCounts(firebase, db);
  const {
    newNotificationApplicationSubmit,
    newNotificationFullApplicationSubmit,
    newNotificationApplicationReminder,
    newNotificationApplicationInWelsh,
    newNotificationCharacterCheckRequest,
    newNotificationCandidateFlagConfirmation,
    newCandidateFormNotification,
    newNotificationPublishedFeedbackReport,
  } = initFactories(config);
  // const slack = initSlack(config);
  const { updateCandidate } = initCandidatesSearch(firebase, db);
  return {
    updateApplication,
    onApplicationCreate,
    sendApplicationConfirmation,
    sendFullApplicationConfirmation,
    sendApplicationReminders,
    sendApplicationInWelsh,
    sendCharacterCheckRequests,
    sendCandidateFormNotifications,
    createApplication,
    createApplications,
    loadTestApplications,
    createTestApplications,
    deleteApplications,
    sendCandidateFlagConfirmation,
    sendPublishedFeedbackReportNotifications,
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
   * - Adds search map
   */
  async function onApplicationCreate(ref, data) {
    console.log('application created');
    // slack.post(`${data.exerciseRef}. New application started`);
    if (data.userId) { await updateCandidate(data.userId); }

    // update application
    const applicationData = {};
    applicationData._sort = {};

    applicationData._sort.fullNameUC = data.personalDetails && data.personalDetails.fullName ? data.personalDetails.fullName.toUpperCase() : '';

    // add search map
    const searchMapSources = [];
    if (data.personalDetails) {
      const { fullName, email, nationalInsuranceNumber } = data.personalDetails;
      if (fullName) searchMapSources.push(fullName);
      if (email) searchMapSources.push(email);
      if (nationalInsuranceNumber) searchMapSources.push(nationalInsuranceNumber);
    }
    if (data.referenceNumber) searchMapSources.push(data.referenceNumber);
    if (searchMapSources.length) applicationData._search = getSearchMap(searchMapSources);

    await ref.update(applicationData);

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
  * sendFullApplicationConfirmation
  * Sends a 'full application submitted' notification for each application
  * @param {*} `params` is an object containing
  *   `applicationId`  (required) ID of application
  *   `application`    (required) application
  */
  async function sendFullApplicationConfirmation(params) {
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
      data: newNotificationFullApplicationSubmit(firebase, applicationId, application, exercise),
    });
    // update application
    commands.push({
      command: 'update',
      ref: applicationRef,
      data: {
        'emailLog.fullApplicationSubmitted': firebase.firestore.Timestamp.fromDate(new Date()),
      },
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? true : false;
  }

  /**
  * sendApplicationReminders
  * Sends 'application submission reminder' notification for each draft application (only send once)
  * @param {*} `params` is an object containing
  *   `exerciseId`  (required) ID of exercise
  */
   async function sendApplicationReminders(params) {
    if (!params.exerciseId) return false;

    // get exercise
    const exerciseId = params.exerciseId;
    const exercise = await getDocument(db.doc(`exercises/${exerciseId}`));
    if (!exercise) return false;

    // get draft applications
    const applicationsRef = db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', '==', 'draft');
    let applications = await getDocuments(applicationsRef);
    applications = applications.filter(application => {
      //if (application.emailLog && application.emailLog.applicationReminder) return false;

      return application.personalDetails && application.personalDetails.fullName && application.personalDetails.email;
    });

    // create database commands
    const commands = [];
    for (let i = 0, len = applications.length; i < len; ++i) {
      const application = applications[i];
      // create notification
      commands.push({
        command: 'set',
        ref: db.collection('notifications').doc(),
        data: newNotificationApplicationReminder(firebase, application.id, application, exercise),
      });

      // update application
      commands.push({
        command: 'update',
        ref: application.ref,
        data: {
          'emailLog.applicationReminder': firebase.firestore.FieldValue.serverTimestamp(),
        },
      });
    }

    // write to db
    if (commands.length) {
        const result = await applyUpdates(db, commands);
        return result ? applications.length : false;
    }
    return 0;
  }

  /**
  * sendApplicationInWelsh
  * Sends an alert to the exercise mailbox if the application is in Welsh
  * @param {*} `params` is an object containing
  *   `applicationId`  (required) ID of application
  *   `application`    (required) application
  */
  async function sendApplicationInWelsh(params) {
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
      data: newNotificationApplicationInWelsh(firebase, applicationId, application, exercise),
    });
    // update application
    commands.push({
      command: 'update',
      ref: applicationRef,
      data: {
        'emailLog.applicationInWelsh': firebase.firestore.Timestamp.fromDate(new Date()),
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
  * Send candidate form notification for each application
  *
  * @param {*} `params` is an object containing
  *   `type` (required) task type
  *   `notificationType` (required) request type (request, reminder, submit)
  *   `items` (required) IDs of applications
  */
  async function sendCandidateFormNotifications(params) {
    const {
      type,
      notificationType,
      items: applicationIds,
      exerciseMailbox,
      exerciseManagerName,
      dueDate,
    } = params;

    // get applications
    const applicationRefs = applicationIds.map(id => db.collection('applications').doc(id));
    const applications = await getAllDocuments(db, applicationRefs);

    // create database commands
    const commands = [];
    for (let i = 0, len = applications.length; i < len; ++i) {
      const application = applications[i];

      // create notification
      const notification = newCandidateFormNotification(firebase, application, notificationType, exerciseMailbox, exerciseManagerName, dueDate);
      if (notification) {
        commands.push({
          command: 'set',
          ref: db.collection('notifications').doc(),
          data: notification,
        });
      }

      // update applicationRecord
      if (notificationType === 'request') {
        const data = {
          [`${type}.requestedAt`]: firebase.firestore.Timestamp.fromDate(new Date()),
          [`${type}.status`]: 'requested',
        };
        commands.push(
          {
            command: 'update',
            ref: db.collection('applicationRecords').doc(application.id),
            data,
          }
        );
      } else if (notificationType === 'reminder') {
        const data = {
          [`${type}.reminderSentAt`]: firebase.firestore.Timestamp.fromDate(new Date()),
          [`${type}.status`]: 'requested',
        };
        commands.push(
          {
            command: 'update',
            ref: db.collection('applicationRecords').doc(application.id),
            data,
          }
        );
      } else if (notificationType === 'submit') { // TODO check this works ok
        commands.push({
          command: 'update',
          ref: application.ref,
          data: {
            'emailLog.preSelectionDayQuestionnaireSubmitted': firebase.firestore.Timestamp.fromDate(new Date()),
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
  * sendCandidateFlagConfirmation
  * Sends a 'candidate flagged confirmation' notification for each application
  * @param {*} `params` is an object containing
  *   `applicationId`  (required) ID of application
  *   `application`    (required) application
  */
   async function sendCandidateFlagConfirmation(params) {
    const applicationId = params.applicationId;
    const application = params.application;
    const applicationRef = db.collection('applications').doc(applicationId);

    // get exercise
    const exerciseId = application.exerciseId;
    const exercise = await getDocument(db.doc(`exercises/${exerciseId}`));
    if (!exercise) return false;

    // Get email recipients from firestore config
    const settingsServices = await getDocument(db.collection('settings').doc('services'));
    const emails = settingsServices.emails.CandidateFlagging;

    if (emails === undefined) {
      console.error('Error retrieving emails for candidate flagging alerts');
      return false;
    }

    // create database commands
    const commands = [];

    for (const email of emails) {
      // create notification
      commands.push({
        command: 'set',
        ref: db.collection('notifications').doc(),
        data: newNotificationCandidateFlagConfirmation(firebase, applicationId, application, exercise, email),
      });
    }

    // update application
    commands.push({
      command: 'update',
      ref: applicationRef,
      data: {
        'emailLog.flaggedCandidate': firebase.firestore.Timestamp.fromDate(new Date()),
      },
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? true : false;
  }

  async function sendPublishedFeedbackReportNotifications(exerciseId, taskType) {
    const validTaskTypes = [
      config.TASK_TYPE.CRITICAL_ANALYSIS,
      config.TASK_TYPE.QUALIFYING_TEST,
      config.TASK_TYPE.SCENARIO,
      config.TASK_TYPE.SITUATIONAL_JUDGEMENT,
    ];
    if (!validTaskTypes.includes(taskType)) {
      console.log(`sendPublishedFeedbackReportNotifications called with invalid task type: ${taskType}`);
      return false;
    }
    const taskRef = db.collection(`exercises/${exerciseId}/tasks`);
    const tasks = await getDocuments(taskRef);
    if (tasks.length > 0) {
      const matchedTasks = tasks.filter(task => task.type === taskType);
      if (matchedTasks.length > 0) {
        const matchedTask = matchedTasks[0];
        const applications = Object.hasOwnProperty.call(matchedTask, 'applications') ? matchedTask.applications : [];
        const emails = applications.map(o => o.email);
        const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
        const commands = [];
        for (let i=0; i<emails.length; ++i) {
          commands.push(
            {
              command: 'set',
              ref: db.collection('notifications').doc(),
              data: newNotificationPublishedFeedbackReport(firebase, emails[i], exercise, taskType),
            }
          );
        }
        return await applyUpdates(db, commands);
      }
    }
    return true;
  }
};
