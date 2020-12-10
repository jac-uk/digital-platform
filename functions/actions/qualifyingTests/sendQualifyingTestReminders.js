const { getDocument, getDocuments, getAllDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const newNotificationQualifyingTestReminder = require('../../shared/factories/Notifications/newNotificationQualifyingTestReminder')(config, firebase);

  return sendQualifyingTestReminders;

  /**
  * sendQualifyingTestReminders
  * Sends a 'qualifying test invite/reminder' notification for each applicant
  * @param {*} `params` is an object containing
  *   `qualifyingTestId` (required) ID of qualifying test
  *
  */
  async function sendQualifyingTestReminders(params) {

    // get qualifying test
    const qualifyingTest = await getDocument(db.doc(`qualifyingTests/${params.qualifyingTestId}`));

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${qualifyingTest.vacancy.id}`));

    // get qualifying test responses
    let qualifyingTestResponsesRef = db.collection('qualifyingTestResponses')
      .where('qualifyingTest.id', '==', qualifyingTest.id)
      .select('application.id');
    const qualifyingTestResponses = await getDocuments(qualifyingTestResponsesRef);
    
    if (qualifyingTestResponses.length) {
      // get corresponding applications
      const applicationRefs = qualifyingTestResponses.map(item => db.collection('applications').doc(item.application.id));
      const applications = await getAllDocuments(db, applicationRefs);

      // create database commands
      const commands = [];
      for (let i = 0, len = applications.length; i < len; ++i) {
        const application = applications[i];
        // create notification
        commands.push({
          command: 'set',
          ref: db.collection('notifications').doc(),
          data: newNotificationQualifyingTestReminder(exercise, application, qualifyingTest),
        });
        // @TODO record that we have sent invite/reminder
      }

      // write to db
      const result = await applyUpdates(db, commands);
      return result ? applications.length : false;
    }

    return false;
  }

};
