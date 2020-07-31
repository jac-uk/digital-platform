/*eslint-disable no-unused-vars*/
const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const getData = require('../sharedServices').getData;
const slog = require('../sharedServices').slog;


const sendCandidateEmail = async (emailTemplateData) => {
  //
  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.notify_candidate_test_submitted in firebase functions like this:
  // firebase functions:config:set notify.templates.notify_candidate_test_submitted="THE_GOVUK_NOTIFY_TEMPLATE_ID"
  const templateId = functions.config().notify.templates.notify_candidate_test_submitted;

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
        that we've received ${emailTemplateData.testType} from them.
      `);
      return true;
    });
};


const notifyCandidateTestReceived = async (applicationData, applicationId) => {
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

  // use this map to set the correct testType to be used by the email template
  let testTypeDisplayMap = new Map([
    ['submitted-sjca-test', 'a qualifying test'],
    ['submitted-scenario-test', 'an online scenario test'],
  ]);  

  const personalizedData = {
    applicantName: candidateData.fullName,
    applicantEmail: candidateData.email,
    applicationId: applicationId,
    exerciseName: exerciseData.name,
    selectionExerciseManager: exerciseData.selectionExerciseManagerFullName,
    testType: testTypeDisplayMap.get(applicationData.status),
  };

  sendCandidateEmail(personalizedData);  

  return null;
};


module.exports = {
    notifyCandidateTestReceived,
};
