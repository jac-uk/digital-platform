/*eslint-disable no-unused-vars*/
const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const db = require('../sharedServices').db;
const getData = require('../sharedServices').getData;

const sendApplicationSubmittedEmailToCandidate = async (data, applicationId) => {
  const candidateData = await getData('candidates', data.candidateId);
  if (candidateData == null) {
    console.error(`ERROR: No data returned from candidates with docId = ${data.candidateId}`);
    return null;
  }
  const candidateEmail = candidateData.email;
  const candidateFullName = candidateData.fullName;

  const exerciseData = await getData('exercises', data.exerciseId);
  if (candidateData == null) {
    console.error(`ERROR: No data returned from exercises with docId = ${data.exerciseId}`);
    return null;
  }  
  const exerciseName = exerciseData.name;

  const personalizedData = {
    candidateFullName: candidateFullName,
    exerciseName: exerciseName,
  };

  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.application_submitted in firebase functions like this:
  // firebase functions:config:set notify.templates.application_submitted="THE_GOVUK_NOTIFY_TEMPLATE_ID"  
  const templateId = functions.config().notify.templates.application_submitted;
  return sendEmail(candidateEmail, templateId, personalizedData).then((sendEmailResponse) => {
    console.info(`${candidateFullName} (${candidateEmail}) has applied to vacancy ${exerciseName}`);
    return true;
  });   
};

const onStatusChange = async (newData, previousData, context) => {
  // We'll only update if the status has changed.
  // This is crucial to prevent infinite loops.
  if (newData.status == previousData.status) return null;

  if (newData.status == 'applied') {
    const applicationId = context.params.applicationId;
    console.info(`Application ${applicationId} status has changed 
                    from ${previousData.status}
                    to ${newData.status}`);
    const response =
      await sendApplicationSubmittedEmailToCandidate(newData, applicationId);
    return response;
  }

  return null;
};

exports.handleApplicationOnUpdate = functions.firestore
  .document('applications/{applicationId}')
  .onUpdate((change, context) => {
    // Retrieve the current and previous value
    const newData = change.after.data();
    const previousData = change.before.data();

    onStatusChange(newData, previousData, context);
  });
