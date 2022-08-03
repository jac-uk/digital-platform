const { app } = require('firebase-admin');
const { getDocuments, getDocument } = require('../../../shared/helpers');

module.exports = (config, firebase, db) => {
  const qts = require('../../../shared/qts')(config);

  return updateQualifyingTestParticipants;

  /**
  * updateQualifyingTestParticipants
  * Update participants of qualifying test
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type`  (required) type/ID of task
  */
  async function updateQualifyingTestParticipants(params) {

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`));
    if (!exercise) return 0;

    // get task
    const taskRef = db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`);
    const task = await getDocument(taskRef);
    if (!task) return { success: false, message: 'Task not found' };
    if (task.status !== config.TASK_STATUS.TEST_INITIALISED) return { success: false, message: 'Task not initialised' };

    // get applications
    let applicationsRef = db.collection('applications')
      .where('exerciseId', '==', params.exerciseId)
      .where('status', '==', 'applied');
    if (task.applicationStatus) {
      applicationsRef = applicationsRef.where('_processing.status', '==', task.applicationStatus);
    }
    const applications = await getDocuments(applicationsRef);
    if (!applications) return { success: false, message: 'No applications found' };

    console.log('applications', applications.length);

    // construct `applications` and `participants`
    const applicationsData = [];
    const participants = [];
    applications.forEach(application => {
      if (application.personalDetails) {
        applicationsData.push({
          id: application.id,
          ref: application.referenceNumber,
          email: application.personalDetails.email || '',
          fullName: application.personalDetails.fullName || '',
          adjustments: application.personalDetails.reasonableAdjustments || false,
        });
        participants.push({
          srcId: application.id,
          ref: application.referenceNumber,
          email: application.personalDetails.email || '',
          fullName: application.personalDetails.fullName || '',
          adjustments: application.personalDetails.reasonableAdjustments || false,
        });
      }
    });

    // send participants to QT Platform
    const response = await qts.post('participants', {
      testId: task.test.id,
      participants: participants,
    });

    // update task
    const taskData = {};
    taskData.applications = applicationsData;
    taskData.status = config.TASK_STATUS.TEST_ACTIVATED;
    taskData[`statusLog.${config.TASK_STATUS.TEST_ACTIVATED}`] = firebase.firestore.FieldValue.serverTimestamp();
    await taskRef.update(taskData);

    // return result
    return response;

  }

};
