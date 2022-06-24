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

    // get task
    const taskRef = db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`);
    const task = await getDocument(taskRef);
    if (!task) return { seccess: false, message: 'Task not found' };
    if (task.status !== config.TASK_STATUS.INITIALISED) return { seccess: false, message: 'Task not initialised' };

    // get applications
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', params.exerciseId)
      .where('status', '==', 'applied')
    );
    if (!applications) return { seccess: false, message: 'No applications found' };

    // construct participants
    const participants = [];
    applications.forEach(application => {
      if (application.personalDetails) {
        participants.push({
          ref: application.referenceNumber,
          email: application.personalDetails.email || '',
          fullName: application.personalDetails.fullName || '',
          adjustments: application.personalDetails.reasonableAdjustments || false,
        });
      }
    });

    // update task with participants
    await taskRef.update({
      participants: participants,
    });

    // send participants to QT Platform
    const response = await qts.post('participants', {
      testId: task.testId,
      participants: participants,
    });

    // update task
    const taskData = {};
    taskData.status = config.TASK_STATUS.ACTIVATED;
    taskData[`statusLog.${config.TASK_STATUS.ACTIVATED}`] = firebase.firestore.FieldValue.serverTimestamp();
    await taskRef.update(taskData);

    // return result
    return response;

  }

};
