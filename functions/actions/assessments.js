import { getDocument, getDocuments, getAllDocuments, getDocumentsFromQueries, applyUpdates, hashEmail } from '../shared/helpers.js';
import initFactories from '../shared/factories.js';
import initNotifications from './notifications.js';
import _ from 'lodash';

export default (config, firebase, db) => {
  const { newAssessment, newNotificationAssessmentRequest, newNotificationAssessmentReminder, newNotificationAssessmentSignInLink, newNotificationAssessmentSubmit } = initFactories(config);
  const { testNotification } = initNotifications(config, db);

  function verifyAssessorIdentity(assessment, identity) {
    return hashEmail(assessment.assessor.email) === identity;
  }

  return {
    initialiseAssessments,
    initialiseMissingAssessments,
    cancelAssessments,
    resetAssessments,
    sendAssessmentRequests,
    sendAssessmentReminders,
    sendAssessmentSignInLink,
    getTestAssessmentAppLink,
    onAssessmentCompleted,
    testAssessmentNotification,
  };

  function getExercise(exerciseId) {
    return getDocument(db.collection('exercises').doc(exerciseId));
  }

  async function onAssessmentCompleted(assessmentId, data) {
    let assessment;
    if (data) {
      assessment = data;
      assessment.id = assessmentId;
    } else {
      assessment = await getDocument(db.collection('assessments').doc(assessmentId));
    }
    const commands = [];

    if (assessment.assessor) {
      // make sure the data type of assessor id is not undefined
      // the assessor id will be undefined when manually upload assessment on admin
      if (!assessment.assessor.id) {
        assessment.assessor.id = '';
      }

      // update application if assessor id exists
      if (assessment.assessor.id) {
        if (assessmentId.indexOf('-1')) {
          commands.push({
            command: 'update',
            ref: db.collection('applications').doc(assessment.application.id),
            data: { firstAssessorID: assessment.assessor.id },
          });
        } else {
          commands.push({
            command: 'update',
            ref: db.collection('applications').doc(assessment.application.id),
            data: { secondAssessorID: assessment.assessor.id },
          });
        }
      }
      
      // update exercise
      const increment = firebase.firestore.FieldValue.increment(1);
      commands.push({
        command: 'update',
        ref: db.collection('exercises').doc(assessment.exercise.id),
        data: { 'assessments.completed': increment },
      });

      // send notification
      const exercise = await getExercise(assessment.exercise.id);
      commands.push({
        command: 'set',
        ref: db.collection('notifications').doc(),
        data: newNotificationAssessmentSubmit(firebase, assessment, exercise),
      });
    }

    // write to db
    const result = await applyUpdates(db, commands);
    return result;
  }

  /**
  * initialiseAssessments
  * Creates assessment requests for each assessor of each application
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `stage` (optional) exercise stage to send out to
  *   `status` (optional) exercise status to send out to
  *   `applicationId` (optional) ID of a specific application to initialise
  */
  async function initialiseAssessments(params) {
    // get exercise
    const exercise = await getExercise(params.exerciseId);
    let applications;

    // check if we're initialising all or individual assessment
    if (params.applicationId) {
      // @TODO check if assessments for application have already been initialised
      const application = await getDocument(db.collection('applications').doc(params.applicationId));
      applications = [ application ];
    } else {
      // don't initialise all if they've already been initialised
      if (exercise.assessments && exercise.assessments.initialised) {
        return false;
      }
      // get applications
      let ref = db.collection('applicationRecords').where('exercise.id', '==', params.exerciseId);
      if (params.stage) {
        ref = ref.where('stage', '==', params.stage);
      }
      if (params.status) {
        if (params.status === 'blank') {
          ref = ref.where('status', '==', '');
        } else {
          ref = ref.where('status', '==', params.status);
        }
      }
      ref = ref.select(); // this is interesting. it allows us to retrieve part or none of the document data (in admin sdk)
      let applicationRecordsSnap = await ref.get();
      const applicationRefs = applicationRecordsSnap.docs.map(item => db.collection('applications').doc(item.id));
      applications = await getAllDocuments(db, applicationRefs); // N.B. we could use a field mask here e.g. { fieldMask: ['status'] }
    }

    // construct db commands
    const commands = [];
    for (let i = 0, len = applications.length; i < len; ++i) {
      const application = applications[i];
      commands.push({
        command: 'set',
        ref: db.collection('assessments').doc(`${application.id}-1`),
        data: newAssessment(exercise, application, 'first'),
      });
      commands.push({
        command: 'set',
        ref: db.collection('assessments').doc(`${application.id}-2`),
        data: newAssessment(exercise, application, 'second'),
      });
    }
    let totalInitialised = applications.length;
    if (exercise.assessments && exercise.assessments.initialised) {
      totalInitialised += exercise.assessments.initialised;
    }
    commands.push({
      command: 'update',
      ref: exercise.ref,
      data: { 'assessments.initialised': totalInitialised },
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applications.length : false;
  }

  /**
  * initialiseMissingAssessments
  * Creates assessment requests for each assessor of each application
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `stage` (optional) exercise stage to send out to
  */
  async function initialiseMissingAssessments(params) {
    // get exercise
    const exercise = await getExercise(params.exerciseId);

    // get application records to initialise assessments for
    const applicationRecords = await getDocuments(
      db.collection('applicationRecords')
      .where('exercise.id', '==', params.exerciseId)
      .where('stage', '==', params.stage)
      .select()
    );
    const applicationIds = applicationRecords.map(item => item.id);

    // get existing assesments
    const assessments = await getDocuments(
      db.collection('assessments')
      .where('exercise.id', '==', params.exerciseId)
      .select()
    );
    const assessmentIds = assessments.map(item => item.id);

    // exclude applications where we have two assessments already
    const missingApplicationIds = applicationIds.filter(applicationId => (assessmentIds.indexOf(`${applicationId}-1`) < 0 || assessmentIds.indexOf(`${applicationId}-2`) < 0));

    // get applications
    const applicationRefs = missingApplicationIds.map(applicationId => db.collection('applications').doc(applicationId));

    const applications = await getAllDocuments(db, applicationRefs);

    // construct db commands
    const commands = [];
    for (let i = 0, len = applications.length; i < len; ++i) {
      const application = applications[i];
      if (assessmentIds.indexOf(`${application.id}-1`) < 0) {
        commands.push({
          command: 'set',
          ref: db.collection('assessments').doc(`${application.id}-1`),
          data: newAssessment(exercise, application, 'first'),
        });
      }
      if (assessmentIds.indexOf(`${application.id}-2`) < 0) {
        commands.push({
          command: 'set',
          ref: db.collection('assessments').doc(`${application.id}-2`),
          data: newAssessment(exercise, application, 'second'),
        });
      }
    }
    let totalInitialised = commands.length;
    if (exercise.assessments && exercise.assessments.initialised) {
      totalInitialised += exercise.assessments.initialised;
    }
    commands.push({
      command: 'update',
      ref: exercise.ref,
      data: { 'assessments.initialised': totalInitialised },
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applications.length : false;
  }

  /**
  * cancelAssessments
  * Cancels assessment requests
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `assessmentIds` (optional) IDs of assessment
  *   `cancelReason` (required) reason to cancel assessment
  */
  async function cancelAssessments(params) {
    // get assessments
    let assessments = null;
    if (params.assessmentIds && params.assessmentIds.length) {
      const assessmentQueries = params.assessmentIds.map(assessmentId => {
        return db.collection('assessments')
          .where('exercise.id', '==', params.exerciseId)
          .where(firebase.firestore.FieldPath.documentId(), '==', assessmentId);
      });
      assessments = await getDocumentsFromQueries(assessmentQueries);
    }

    if (!assessments) return false;

    // create database commands
    const commands = [];
    let prevStatus = null;
    for (let i = 0, len = assessments.length; i < len; ++i) {
      const assessment = assessments[i];
      prevStatus = assessment.status;
      commands.push({
        command: 'update',
        ref: assessment.ref,
        data: {
          status: 'cancelled',
          cancelReason: params.cancelReason,
        },
      });
    }

    // udpate exercise
    if (assessments.length && prevStatus) {
      const exercise = await getExercise(params.exerciseId);
      let sent = exercise.assessments.sent ? exercise.assessments.sent : 0;
      let completed = exercise.assessments.completed ? exercise.assessments.completed : 0;
      
      sent = (sent && sent - assessments.length >= 0) ? sent - assessments.length : 0;
      if (prevStatus === 'completed') {
        completed = (completed && completed - assessments.length >= 0) ? completed - assessments.length : 0;
      }

      commands.push({
        command: 'update',
        ref: exercise.ref,
        data: {
          'assessments.sent': sent,
          'assessments.completed': completed,
        },
      });
    }

    // write to db
    result = await applyUpdates(db, commands);
    return result ? assessments.length : false;
  }

  /**
  * resetAssessments
  * Resets assessment status to draft.
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `assessmentIds` (optional) IDs of assessment
  *   `status` (optional) status of assessment
  */
  async function resetAssessments(params) {
    // get assessments
    let assessments = null;
    if (params.assessmentIds && params.assessmentIds.length) {
      const assessmentQueries = params.assessmentIds.map(assessmentId => {
        return db.collection('assessments')
          .where('exercise.id', '==', params.exerciseId)
          .where(firebase.firestore.FieldPath.documentId(), '==', assessmentId);
      });
      assessments = await getDocumentsFromQueries(assessmentQueries);
    }

    if (!assessments) return false;

    // create database commands
    const commands = [];
    let prevStatus = null;
    for (let i = 0, len = assessments.length; i < len; ++i) {
      const assessment = assessments[i];
      prevStatus = assessment.status;
      commands.push({
        command: 'update',
        ref: assessment.ref,
        data: {
          status: params.status,
          cancelReason: null,
          declineReason: null,
          filePath: null,
          fileRef: null,
          approved: false,
          submittedDate: null,
          updatedDate: null,
        },
      });
    }

    // udpate exercise
    if (assessments.length && prevStatus) {
      const exercise = await getExercise(params.exerciseId);
      let sent = exercise.assessments.sent ? exercise.assessments.sent : 0;
      let completed = exercise.assessments.completed ? exercise.assessments.completed : 0;
      
      if (prevStatus === 'pending' && ['draft', 'cancelled', 'deleted'].includes(params.status)) {
        sent = (sent && sent - assessments.length >= 0) ? sent - assessments.length : 0;
      } else if (prevStatus === 'completed' && ['draft', 'cancelled', 'deleted'].includes(params.status)) {
        sent = (sent && sent - assessments.length >= 0) ? sent - assessments.length : 0;
        completed = (completed && completed - assessments.length >= 0) ? completed - assessments.length : 0;
      } else if (prevStatus === 'completed' && ['pending'].includes(params.status)) {
        completed = (completed && completed - assessments.length >= 0) ? completed - assessments.length : 0;
      } else if (prevStatus === 'declined' && ['draft'].includes(params.status)) {
        sent = (sent && sent - assessments.length >= 0) ? sent - assessments.length : 0;
      }

      commands.push({
        command: 'update',
        ref: exercise.ref,
        data: {
          'assessments.sent': sent,
          'assessments.completed': completed,
        },
      });
    }

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? assessments.length : false;
  }


  /**
  * testAssessmentNotification
  * Sends notification to the provided email address. For testing/checking purposes
  * @param {*} `params` is an object containing
  *   `assessmentIds` (required) IDs of assessment
  *   `notificationType` (required) type of notification to send ('request'|'reminder'|'success')
  *   `email` (required) email address to send the notification to
  * @TODO sort out the 'success' template
  */
  async function testAssessmentNotification(params) {
    const results = [];
    let exercise = null;
    for (let i = 0; i < params.assessmentIds.length; i++) {
      const assessmentId = params.assessmentIds[i];
      const assessment = await getDocument(db.doc(`assessments/${assessmentId}`));
      let result = false;

      if (assessment) {
        if (!exercise) exercise = await getExercise(assessment.exercise.id);
        // @TODO update to handle other assessment templates
        switch (params.notificationType) {
          case 'request':
            result = await testNotification(newNotificationAssessmentRequest(firebase, assessment, exercise), params.email);
            break;
          case 'reminder':
            result = await testNotification(newNotificationAssessmentReminder(firebase, assessment, exercise), params.email);
            break;
          case 'success':
            result = await testNotification(newNotificationAssessmentRequest(firebase, assessment, exercise), params.email);
            break;
          default:
            break;
        }
      }
      results.push({ assessmentId, result });
    }
    return results;
  }


  /**
   * Checks that email addresses are present and valid for all assessments
   *
   * @param {collection} assessments to check
   * @return true if all are valid and a {collection} of errors otherwise
   */
  function validateAssessorEmailAddresses(assessments) {
    const errors = [];

    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    assessments.forEach(assessment => {
      if (emailRegEx.test(assessment.assessor.email) === false) {
        errors.push({
          applicationRef: assessment.application.referenceNumber,
          assessor: assessment.assessor,
        });
      }
    });

    if (errors.length) {
      return { errors: errors };
    }
    return true;
  }

  /**
  * sendAssessmentRequests
  * Sends a 'request for assessment' notification for each assessment
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `assessmentId` (optional) ID of an assessment
  *   `assessmentIds` (optional) array of assessment IDs
  *   `resend` (optional) boolean if true sends to 'pending' as well as 'draft' assessments
  *
  * Note: if neither `assessmentId` or `assessmentIds`
  *       are provided function will send requests for
  *       all assessments
  */
  async function sendAssessmentRequests(params) {
    // get exercise
    const exercise = await getExercise(params.exerciseId);

    // if param is applicationId then we expect exercise to have started sending IAs. So check this.
    // if this is not the case then we need to initialise/create the IA, send the request and update exercise stats

    // get assessments
    const status = params.resend ? ['draft','pending'] : ['draft'];
    let assessments = null;
    if (params.assessmentId) {
      const assessmentsRef = db.collection('assessments')
        .where('exercise.id', '==', params.exerciseId)
        .where('status', 'in', status)
        .where(firebase.firestore.FieldPath.documentId(), '==', params.assessmentId);
      assessments = await getDocuments(assessmentsRef);
    } else if (params.assessmentIds && params.assessmentIds.length) {
      const assessmentQueries = params.assessmentIds.map(assessmentId => {
        return db.collection('assessments')
          .where('exercise.id', '==', params.exerciseId)
          .where('status', 'in', status)
          .where(firebase.firestore.FieldPath.documentId(), '==', assessmentId);
      });
      assessments = await getDocumentsFromQueries(assessmentQueries);
    } else {
      const assessmentsRef = db.collection('assessments')
        .where('exercise.id', '==', params.exerciseId)
        .where('status', 'in', status);
      assessments = await getDocuments(assessmentsRef);
    }

    if (!assessments) return false;

    let result = validateAssessorEmailAddresses(assessments);

    if (result !== true) {
      return result;
    }

    const chunks = _.chunk(assessments, 100);

    for (const chunkedAssessments of chunks) {
      // create database commands
      const commands = [];
      let countDraft = 0;
      for (let i = 0, len = chunkedAssessments.length; i < len; ++i) {
        const assessment = chunkedAssessments[i];
        // create notification
        commands.push({
          command: 'set',
          ref: db.collection('notifications').doc(),
          data: newNotificationAssessmentRequest(firebase, assessment, exercise),
        });
        // update assessment
        if (assessment.status === 'draft') { countDraft++; }
        commands.push({
          command: 'update',
          ref: assessment.ref,
          data: {
            status: 'pending',
          },
        });
      }
      if (countDraft) {
        let currentSent = exercise.assessments.sent ? exercise.assessments.sent : 0;
        commands.push({
          command: 'update',
          ref: exercise.ref,
          data: { 'assessments.sent': currentSent + countDraft },
        });
      }

      // write to db
      result = await applyUpdates(db, commands);
      console.log(`${chunkedAssessments.length}/${assessments.length} assessment processed`);
    }

    return result ? assessments.length : false;
  }

  /**
  * sendAssessmentReminders
  * Sends an 'assessment reminder' notification for each assessment
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `assessmentId` (optional) ID of an assessment
  *   `assessmentIds` (optional) array of assessment IDs
  *
  * Note: if neither `assessmentId` or `assessmentIds`
  *       are provided function will send requests for
  *       all assessments
  */
  async function sendAssessmentReminders(params) {
    // get exercise
    const exercise = await getExercise(params.exerciseId);

    // get assessments
    let assessments = null;
    if (params.assessmentId) {
      const assessmentsRef = db.collection('assessments')
        .where('exercise.id', '==', params.exerciseId)
        .where('status', '==', 'pending')
        .where(firebase.firestore.FieldPath.documentId(), '==', params.assessmentId);
      assessments = await getDocuments(assessmentsRef);
    } else if (params.assessmentIds && params.assessmentIds.length) {
      const assessmentQueries = params.assessmentIds.map(assessmentId => {
        return db.collection('assessments')
          .where('exercise.id', '==', params.exerciseId)
          .where('status', '==', 'pending')
          .where(firebase.firestore.FieldPath.documentId(), '==', assessmentId);
      });
      assessments = await getDocumentsFromQueries(assessmentQueries);
    }

    if (!assessments) return false;

    let result = validateAssessorEmailAddresses(assessments);
    if (result !== true) {
      return result;
    }

    // create database commands
    const commands = [];
    for (let i = 0, len = assessments.length; i < len; ++i) {
      const assessment = assessments[i];
      // create notification
      commands.push({
        command: 'set',
        ref: db.collection('notifications').doc(),
        data: newNotificationAssessmentReminder(firebase, assessment, exercise),
      });
    }

    // write to db
    result = await applyUpdates(db, commands);
    return result ? assessments.length : false;
  }

    /**
  * sendAssessmentRequests
  * Sends a 'request for assessment' notification for each assessment
  * @param {*} `params` is an object containing
  *   `assessmentId` ID of an assessment
  *   `identity` hash of assessor's email
  *
  * Note: if neither `assessmentId` or `assessmentIds`
  *       are provided function will send requests for
  *       all assessments
  */
  async function sendAssessmentSignInLink(params) {
    // get assessment
    const assessment = await getDocument(db.collection('assessments').doc(params.assessmentId));
    if (!assessment) {
      console.log('assessment not found:', params.assessmentId);
      return false;
    }

    // get exercise
    const exercise = await getExercise(assessment.exercise.id);
    if (!exercise) {
      console.log('exercise not found:', assessment.exercise.id);
      return false;
    }

    // verify identity
    if (!verifyAssessorIdentity(assessment, params.identity)) {
      console.log('invalid identity:', params.identity);
      return false;
    }

    let result = validateAssessorEmailAddresses([assessment]);

    if (result !== true) {
      return result;
    }

    // create database commands
    const commands = [];

    // create notification
    commands.push({
      command: 'set',
      ref: db.collection('notifications').doc(),
      data: newNotificationAssessmentSignInLink(firebase, assessment, exercise),
    });

    // write to db
    result = await applyUpdates(db, commands);

    return result ? true : false;
  }

  /**
  * getTestingAssessmentSignInLink
  * 
  * @param {*} `params` is an object containing
  *   `assessmentId` ID of an assessment
  *
  * Note: if neither `assessmentId` or `assessmentIds`
  *       are provided function will send requests for
  *       all assessments
  */
  async function getTestAssessmentAppLink(params) {
    // get assessment
    const assessment = await getDocument(db.collection('assessments').doc(params.assessmentId));
    if (!assessment) {
      console.log('assessment not found:', params.assessmentId);
      return false;
    }

    // get exercise
    const exercise = await getExercise(assessment.exercise.id);
    if (!exercise) {
      console.log('exercise not found:', assessment.exercise.id);
      return false;
    }

    const notification = newNotificationAssessmentSignInLink(firebase, assessment, exercise);

    return notification.personalisation.uploadUrl;
  }

};
