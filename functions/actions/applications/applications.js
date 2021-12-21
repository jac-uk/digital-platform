const { getAllDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const { newNotificationCharacterCheckRequest } = require('../../shared/factories')(config);
  const slack = require('../../shared/slack')(config);
  const { updateCandidate } = require('../candidates/search')(firebase, db);
  return {
    updateApplication,
    onApplicationCreate,
    sendCharacterCheckRequests,
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
   * Application created event handler
   * - Posts message to slack
   * - Increment exercise applications count
   */
  async function onApplicationCreate(ref, data) {
    slack.post(`${data.exerciseRef}. New application started`);
    if (data.userId) { await updateCandidate(data.userId); }
    const saveData = {};
    saveData[`applications.${data.status}`] = firebase.firestore.FieldValue.increment(1);
    await db.doc(`exercises/${data.exerciseId}`).update(saveData);
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
      }
      if (type !== 'request') {
        commands.push({
          command: 'update',
          ref: application.ref,
          data: {
            'characterChecks.reminderSentAt': firebase.firestore.Timestamp.fromDate(new Date()),
          },
        });
      }
    }

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applications.length : false;
  }


};
