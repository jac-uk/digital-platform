const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const getData = require('../sharedServices').getData;
const setData = require('../sharedServices').setData;
const slog = require('../sharedServices').slog;


const setApplicationDataAfterSendingEmail = async (emailTemplateData) => {
  const data = {
    status: 'not-recommended-email-sent',
  };
  setData('applications', emailTemplateData.applicationId, data);
  return null;
};

const sendCandidateEmail = async (emailTemplateData) => {
  //
  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.notify_candidate_not_recommended in firebase functions like this:
  // firebase functions:config:set notify.templates.notify_candidate_not_recommended="THE_GOVUK_NOTIFY_TEMPLATE_ID"
  const templateId = functions.config().notify.templates.notify_candidate_not_recommended;

  console.log('templateId = ', templateId);
  if (templateId === null) {
    console.log('ERROR: invalid templateId: ', templateId);
    return null;
  }

  return sendEmail(emailTemplateData.applicantEmail, templateId, emailTemplateData)
    .then((sendEmailResponse) => {
      slog(`
        INFO: Notified Candidate: ${emailTemplateData.applicantEmail} 
        with ApplicationId: ${emailTemplateData.applicationId}
        that they were not recommended 
      `);

      // set Application status to 'not-recommended-email-sent' after sending email
      setApplicationDataAfterSendingEmail(emailTemplateData);
      return sendEmailResponse;
    })
    .catch(err => {
      console.error('Error Sending Email sendCandidateEmail:', err);
      return false;
    });
};
  
  
const notifyCandidateNotRecommended = async (applicationData, applicationId) => {
  const exerciseData = await getData('exercises', applicationData.exerciseId);
  if (exerciseData === null) {
    slog(`
      ERROR: No data returned from Exercises with docId = ${applicationData.exerciseId}
    `);
    return null;
  }

  const candidateData = await getData('candidates', applicationData.userId);
  if (candidateData === null) {
    slog(`
      ERROR: No data returned from Candidates with docId = ${applicationData.userId}
    `);
    return null;
  }

  const personalizedData = {
    applicantName: candidateData.fullName,
    applicantEmail: candidateData.email,
    applicationId: applicationId,
    exerciseName: exerciseData.name,
    selectionExerciseManager: exerciseData.selectionExerciseManagerFullName,
  };

  sendCandidateEmail(personalizedData);  

  return null;
};


module.exports = {
  notifyCandidateNotRecommended,
};
