const { getDocument, getDocuments, getAllDocuments, applyUpdates } = require('../shared/helpers');

module.exports = (config, firebase, db) => {
  const { newAssessment, newNotificationAssessmentRequest, newNotificationAssessmentReminder } = require('../shared/factories')(config);
  const { testNotification } = require('./notifications')(config, db);

  return {
    initialiseAssessments,
    initialiseMissingAssessments,
    cancelAssessments,
    sendAssessmentRequests,
    sendAssessmentReminders,
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
    } else {
      assessment = await getDocument(db.collection('assessments').doc(assessmentId));
    }
    const commands = [];
    if (assessment.assessor && assessment.assessor.id) {
      // update application
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
      // update exercise
      const increment = firebase.firestore.FieldValue.increment(1);
      commands.push({
        command: 'update',
        ref: db.collection('exercises').doc(assessment.exercise.id),
        data: { 'assessments.completed': increment },
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
      let applicationRecordsSnap = await db.collection('applicationRecords')
        .where('exercise.id', '==', params.exerciseId)
        .where('stage', '==', params.stage)
        .select() // this is interesting. it allows us to retrieve part or none of the document data (in admin sdk)
        .get();
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
  * Cancels assessment requests. Currently deletes all assessments.
  * @TODO only delete draft assessments, mark others as cancelled
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  */
  async function cancelAssessments(params) {
    // delete assessments
    let snap = await db.collection('assessments')
      .where('exercise.id', '==', params.exerciseId)
      .select()
      .get();
    for (let i = 0, len = snap.docs.length; i < len; ++i) {
      await snap.docs[i].ref.delete();
    }

    // update exercise
    await db.collection('exercises').doc(params.exerciseId).update({
      assessments: {},
    });
  }


  /**
  * testAssessmentNotification
  * Sends notification to the provided email address. For testing/checking purposes
  * @param {*} `params` is an object containing
  *   `assessmentId` (required) ID of assessment
  *   `notificationType` (required) type of notification to send ('request'|'reminder'|'success')
  *   `email` (required) email address to send the notification to
  * @TODO sort out the 'success' template
  */
  async function testAssessmentNotification(params) {
    const assessment = await getDocument(db.doc(`assessments/${params.assessmentId}`));
    if (assessment) {
      // @TODO update to handle other assessment templates
      switch (params.notificationType) {
        case 'request':
          return testNotification(newNotificationAssessmentRequest(firebase, assessment), params.email);
        case 'reminder':
          return testNotification(newNotificationAssessmentReminder(firebase, assessment), params.email);
        case 'success':
          return testNotification(newNotificationAssessmentRequest(firebase, assessment), params.email);
        default:
          break;
      }
    }
    return false;
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
    let assessmentsRef = db.collection('assessments')
      .where('exercise.id', '==', params.exerciseId);
    if (params.resend) {
      assessmentsRef = assessmentsRef.where('status', 'in', ['draft','pending']);
    } else {
      assessmentsRef = assessmentsRef.where('status', '==', 'draft');
    }
    if (params.assessmentIds && params.assessmentIds.length) {
      assessmentsRef = assessmentsRef.where(firebase.firestore.FieldPath.documentId(), 'in', params.assessmentIds);
    }
    if (params.assessmentId) {
      assessmentsRef = assessmentsRef.where(firebase.firestore.FieldPath.documentId(), '==', params.assessmentId);
    }
    const assessments = await getDocuments(assessmentsRef);

    let result = validateAssessorEmailAddresses(assessments);

    if (result !== true) {
      return result;
    }

    // create database commands
    const commands = [];
    let countDraft = 0;
    for (let i = 0, len = assessments.length; i < len; ++i) {
      const assessment = assessments[i];
      // create notification
      commands.push({
        command: 'set',
        ref: db.collection('notifications').doc(),
        data: newNotificationAssessmentRequest(firebase, assessment),
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

    // get assessments
    let assessmentsRef = db.collection('assessments')
      .where('exercise.id', '==', params.exerciseId)
      .where('status', '==', 'pending');
    if (params.assessmentIds && params.assessmentIds.length) {
      assessmentsRef = assessmentsRef.where(firebase.firestore.FieldPath.documentId(), 'in', params.assessmentIds);
    }
    if (params.assessmentId) {
      assessmentsRef = assessmentsRef.where(firebase.firestore.FieldPath.documentId(), '==', params.assessmentId);
    }
    const assessments = await getDocuments(assessmentsRef);

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
        data: newNotificationAssessmentReminder(firebase, assessment),
      });
    }

    // write to db
    result = await applyUpdates(db, commands);
    return result ? assessments.length : false;
  }

};
