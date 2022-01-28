const { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } = require('constants');
const { getAllDocuments, applyUpdates } = require('../../shared/helpers');


module.exports = (config, firebase, db) => {
  const { newNotificationCharacterCheckRequest } = require('../../shared/factories')(config);
  const slack = require('../../shared/slack')(config);
  const { updateCandidate } = require('../candidates/search')(firebase, db);
  return {
    updateApplication,
    onApplicationCreate,
    sendCharacterCheckRequests,
    createApplication,
    createApplications,
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
