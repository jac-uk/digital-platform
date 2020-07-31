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
  // Set notify.templates.notify_candidate_eligibility_fail_statutory_criteria in firebase functions like this:
  // firebase functions:config:set notify.templates.notify_candidate_eligibility_fail_statutory_criteria="THE_GOVUK_NOTIFY_TEMPLATE_ID"
  let eligibilityResultTemplateIdMap = new Map([
    ['fail: statutory criteria', functions.config().notify.templates.notify_candidate_eligibility_fail_statutory_criteria],
    ['fail: RLS', functions.config().notify.templates.notify_candidate_eligibility_fail_rls],
    ['pass', functions.config().notify.templates.notify_candidate_eligibility_pass],
  ]);
  // with the proper testResult, set the correct templateId
  const templateId = eligibilityResultTemplateIdMap.get(emailTemplateData.eligibility);

  console.log('templateId = ', templateId);
  if (templateId === null) {
    console.log('ERROR: invalid templateId: ', templateId);
    return null;
  }

  return sendEmail(emailTemplateData.applicantEmail, templateId, emailTemplateData)
    .then((sendEmailResponse) => {
      slog(`
        INFO: Email sent to Candidate: ${emailTemplateData.applicantEmail} 
        with ApplicationId: ${emailTemplateData.applicationId}
        about their Eligibility. 
        Result: ${emailTemplateData.eligibility}
      `);
      return true;
    });
};


const notifyCandidatesEligibilityResult = async (applicationData, applicationId) => {
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

  // TODO: Fix selectionExerciseManager. Right now, all Exercise contacts
  // are stored as email addresses. We should allow a normal name here.

  const personalizedData = {
    applicantName: candidateData.fullName,
    applicantEmail: candidateData.email,
    applicationId: applicationId,
    exerciseName: exerciseData.name,
    selectionExerciseManager: exerciseData.exerciseMailbox,
    eligibility: applicationData.eligibility,
  };

  sendCandidateEmail(personalizedData);  

  return null;
};


module.exports = {
  notifyCandidatesEligibilityResult,
};
