/*eslint-disable no-unused-vars*/
const functions = require('firebase-functions');
const getData = require('../sharedServices').getData;
const slog = require('../sharedServices').slog;
const sendEmail = require('../sharedServices').sendEmail;


const sendCandidateQTResultsEmail = async (emailTemplateData) => {
  //
  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.notify_candidate_qt_fail_out_on_time in firebase functions like this:
  // firebase functions:config:set notify.templates.notify_candidate_qt_fail_out_on_time="THE_GOVUK_NOTIFY_TEMPLATE_ID"
  let testResultTemplateIdMap = new Map([
    ['fail: no submission', functions.config().notify.templates.notify_candidate_qt_fail_no_submission],
    ['fail: sjca out on time', functions.config().notify.templates.notify_candidate_multiple_choice_qt_fail_out_on_time],
    ['fail: sjca unsuccessful', functions.config().notify.templates.notify_candidate_multiple_choice_qt_fail_unsuccessful],
    ['fail: scenario out on time', functions.config().notify.templates.notify_candidate_scenario_qt_fail_out_on_time],
    ['fail: scenario unsuccessful', functions.config().notify.templates.notify_candidate_scenario_qt_fail_unsuccessful],
    ['pass', functions.config().notify.templates.notify_candidate_qt_pass],
  ]);
  // with the proper testResult, set the correct templateId
  const templateId = testResultTemplateIdMap.get(emailTemplateData.testResult);

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
        about the result of their Qualifying Test: ${emailTemplateData.testType}.
        Result: ${emailTemplateData.testResult}
      `);
      return true;
    });
};


const notifyCandidatesQTResults = async (applicationData, applicationId, testType) => {
  const exerciseData = await getData('exercises', applicationData.exerciseId);
  if (exerciseData === null) {
    slog(`
      ERROR: No data returned from Exercises with docId = ${applicationData.exerciseId}
    `);
    return null;
  }

  const exerciseTestPassScoreFieldName = `${testType}TestPassScore`;
  const exerciseTestPassScore = exerciseData[exerciseTestPassScoreFieldName];

  const candidateData = await getData('candidates', applicationData.userId);
  if (candidateData === null) {
    slog(`
      ERROR: No data returned from Candidates with docId = ${applicationData.userId}
    `);
    return null;
  }

  const applicantTestScoreFieldName = `${testType}TestScore`;
  const applicantTestScore = applicationData[applicantTestScoreFieldName];
  const applicantTestResultFieldName = `${testType}TestResult`;
  const applicantTestResult = applicationData[applicantTestResultFieldName];  
 
  let testTypeDisplayMap = new Map([
    ['sjca', 'a qualifying test'],
    ['scenario', 'an online scenario test'],
  ]);

  // TODO: Fix selectionExerciseManager. Right now, all Exercise contacts
  // are stored as email addresses. We should allow a normal name here.

  const personalizedData = {
    applicantName: candidateData.fullName,
    applicantEmail: candidateData.email,
    applicationId: applicationId,
    exerciseName: exerciseData.name,
    testPassScore: exerciseTestPassScore,
    applicantTestScore: applicantTestScore,
    selectionExerciseManager: exerciseData.exerciseMailbox,
    testResult: applicantTestResult,
    testType: testTypeDisplayMap.get(testType),
  };

  sendCandidateQTResultsEmail(personalizedData);  

  return null;
};

module.exports = {
  notifyCandidatesQTResults,
};
