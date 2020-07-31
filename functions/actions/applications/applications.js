const { getAllDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const slack = require('../../shared/slack')(config);
  return {
    updateApplication,
    onApplicationCreate,
    onApplicationUpdate,
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
   * - Add timestamp to document
   */
  function onApplicationCreate(ref, data) {
    slack.post(`${data.exerciseRef}. New application started`);
    return ref.set({
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
    }, { 
      merge: true 
    });
  }

  /**
   * Application updated event handler
   * - 
   */
  async function onApplicationUpdate(dataBefore, dataAfter) {
    // if (dataBefore.status !== dataAfter.status) {
    //   const exerciseId = dataBefore.exercise.id;
    //   const data = {};
    //   const increment = firebase.firestore.FieldValue.increment(1);
    //   const decrement = firebase.firestore.FieldValue.increment(-1);
    //   data[`applications.${dataBefore.status}`] = decrement;
    //   data[`applications.${dataAfter.status}`] = increment;
    //   await db.doc(`exercises/${exerciseId}`).update(data);
    // }
    return true;
  }

  /**
  * sendCharacterCheckRequests
  * Sends a 'request for character check' notification for each application
  * @param {*} `params` is an object containing
  *   `items` (required) IDs of applications
  */
  async function sendCharacterCheckRequests(params) {
    const applicationIds = params.items;
    // get applications
    const applicationRefs = applicationIds.map(id => db.collection('applications').doc(id));
    const applications = await getAllDocuments(db, applicationRefs);

    // create database commands
    const commands = [];
    for (let i = 0, len = applications.length; i < len; ++i) {
      const application = applications[i];
      // // create notification
      // commands.push({
      //   command: 'set',
      //   ref: db.collection('notifications').doc(),
      //   data: newNotificationCharacterCheckRequest(firebase, application),
      // });
      // update application
      commands.push({
        command: 'update',
        ref: application.ref,
        data: {
          'characterChecks.requestedAt': firebase.firestore.Timestamp.fromDate(new Date()),
        },
      });
    }

    // @TODO update count/stat for how many consents have been requested

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? applications.length : false;
  }


}
