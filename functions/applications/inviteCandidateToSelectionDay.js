const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const getData = require('../sharedServices').getData;
const setData = require('../sharedServices').setData;
const slog = require('../sharedServices').slog;


const setApplicationDataAfterSendingEmail = async (emailTemplateData) => {
  const data = {
    status: 'selection-day-invite-sent',
  };
  setData('applications', emailTemplateData.applicationId, data);
  return null;
};

const sendCandidateEmail = async (emailTemplateData) => {
  //
  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.invite_candidate_to_selection_day in firebase functions like this:
  // firebase functions:config:set notify.templates.invite_candidate_to_selection_day="THE_GOVUK_NOTIFY_TEMPLATE_ID"
  const templateId = functions.config().notify.templates.invite_candidate_to_selection_day;

  console.log('templateId = ', templateId);
  if (templateId == null) {
    console.log('ERROR: invalid templateId: ', templateId);
    return null;
  }

  return sendEmail(emailTemplateData.applicantEmail, templateId, emailTemplateData)
    .then((sendEmailResponse) => {
      slog(`
        INFO: Invited Candidate: ${emailTemplateData.applicantEmail} 
        with ApplicationId: ${emailTemplateData.applicationId}
        to Selection Day
      `);

      // set Application status to 'selection-day-invite-sent' after sending email
      setApplicationDataAfterSendingEmail(emailTemplateData);
      return sendEmailResponse;
    })
    .catch(err => {
      console.error('Error Sending Email sendCandidateEmail:', err);
      return false;
    });
};
  
  
const inviteCandidateToSelectionDay = async (applicationData, applicationId) => {
  const exerciseData = await getData('exercises', applicationData.exerciseId);
  if (exerciseData == null) {
    slog(`
      ERROR: No data returned from Exercises with docId = ${applicationData.exerciseId}
    `);
    return null;
  }

  const candidateData = await getData('candidates', applicationData.userId);
  if (candidateData == null) {
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
    exerciseMailbox: exerciseData.exerciseMailbox,
    exercisePhoneNumber: exerciseData.exercisePhoneNumber,
  };

  sendCandidateEmail(personalizedData);  

  return null;
};


module.exports = {
  inviteCandidateToSelectionDay,
};
