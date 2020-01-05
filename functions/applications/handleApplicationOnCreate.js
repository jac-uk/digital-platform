const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const getData = require('../sharedServices').getData;
const setData = require('../sharedServices').setData;
const slog = require('../sharedServices').slog;

const setApplicationOnCreateData = async (snap, context) => {
  slog(`New Application (${context.params.applicationId}) created`);
  const data = snap.data();

  // pass in exerciseId and candidateId and save it to firestore
  if (data.exerciseId == null) {
    slog(`
      ERROR: Application onCreate did not set exerciseId field.
    `);
    return false;
  }

  if (data.userId == null) {
    slog(`
      ERROR: Application onCreate did not set userId field.
    `);
    return false; 
  }

  // and initialize a createdAt for easier sorting
  const newFieldsData = {
    createdAt: Date.now(),
    status: 'draft',
    firstAssessorSubmittedAssessment: false,
    secondAssessorSubmittedAssessment: false,    
  };

  return await setData('applications', context.params.applicationId, newFieldsData);
};

const sendApplicationStartedEmailToCandidate = async (snap, context) => {
  const data = snap.data();

  const candidateData = await getData('candidates', data.userId);
  if (candidateData == null) {
    slog(`ERROR: No data returned from Candidates with docId (${data.userId})`);
    return null;
  }
  const candidateEmail = candidateData.email;
  const candidateFullName = candidateData.fullName;

  const personalizedData = {
    applicantName: candidateFullName,
    applicationUrl: `https://apply.judicialappointments.digital/apply/${data.exerciseId}/`,
  };

  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.application_started in firebase functions like this:
  // firebase functions:config:set notify.templates.application_started="THE_GOVUK_NOTIFY_TEMPLATE_ID"  
  const templateId = functions.config().notify.templates.application_started;
  return sendEmail(candidateEmail, templateId, personalizedData)
    .then((sendEmailResponse) => {
      slog(`${candidateFullName} (${candidateEmail}) has started to apply to exerciseId ${data.exerciseId}`);
      return sendEmailResponse;
    })
    .catch(err => {
      console.error('Something went wrong creating Application ID: ', context.params.applicationId);
      console.error('Error Sending Email sendApplicationStartedEmailToCandidate:', err);
      return false;
    });  
};

exports.handleApplicationOnCreate = functions.region('europe-west2').firestore
  .document('applications/{applicationId}')
  .onCreate( (snap, context) => {

    // onCreate set application data with data passed in:
    // - userId
    // - exerciseId
    setApplicationOnCreateData(snap, context);

    // after setting the data, send the candidate an email 
    // so they can track their application to a judgeship vacancy
    sendApplicationStartedEmailToCandidate(snap, context);
    return null;
  });
