/*eslint-disable no-unused-vars*/
const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const getData = require('../sharedServices').getData;
const setData = require('../sharedServices').setData;
const slog = require('../sharedServices').slog;

/*
const setApplicationDataAfterSendingEmail = async (emailTemplateData, whichAssessor) => {
  const data = {
    status: 'assessors-requests-sent',
  };
 
  // set the correct (first or second) AssessorSubmittedAssessment field to true
  const assessorSubmittedAssessmentFieldName = `${whichAssessor}SubmittedAssessment`;
  data[assessorSubmittedAssessmentFieldName] = true;

  setData('applications', emailTemplateData.applicationId, data);
  return null;
};
*/


const sendAssessorEmail = async (emailTemplateData, whichAssessor) => {
  //
  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.notify_assessor_to_assess in firebase functions like this:
  // firebase functions:config:set notify.templates.notify_assessor_to_assess="THE_GOVUK_NOTIFY_TEMPLATE_ID"
  const templateId = functions.config().notify.templates.notify_assessor_to_assess;

  console.log('templateId = ', templateId);
  if (templateId === null) {
    console.log('ERROR: invalid templateId: ', templateId);
    return null;
  }

  // check if candidate is trying to independently assess themselves
  if (emailTemplateData.assessorEmail === emailTemplateData.applicantEmail) {
    slog(`
      WARNING! ${emailTemplateData.applicantName} is trying to independently assess themselves.
      Flag Application ID ${emailTemplateData.applicationId} immediately!
    `);
  }

  return sendEmail(emailTemplateData.assessorEmail, templateId, emailTemplateData)
    .then((sendEmailResponse) => {
      slog(`
        INFO: Asked Assessor: ${emailTemplateData.assessorName} (${emailTemplateData.assessorEmail})
        to assess Candidate: ${emailTemplateData.applicantName} (${emailTemplateData.applicantEmail})
        against ApplicationId: ${emailTemplateData.applicationId}
      `);

      // set the correct (first or second) AssessorSubmittedAssessment field
      //setApplicationDataAfterSendingEmail(emailTemplateData, whichAssessor);
      return true;
    });
};


const generateDownloadUrl = async (applicationId) => {
  return `https://gov.uk/independent-assessor-template/${applicationId}`;
};


const notifyAssessorsToAssess = async (applicationData, applicationId) => {
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

  // TODO: fix downloadUrl by making a function to generate download URL from 
  // exercise.uploadedIndependentAssessorTemplate value
  // Fix uploadUrl too.
  const downloadUrl = await generateDownloadUrl(applicationId);

  let personalizedData = {
    applicantName: candidateData.fullName,
    applicantEmail: candidateData.email,
    applicationId: applicationId,
    exerciseName: exerciseData.name,
    selectionExerciseManager: exerciseData.selectionExerciseManagerFullName,
    xCompetencyAreasOrXSkillsAndAbilities: 'Competency Areas',
    downloadUrl: downloadUrl,
    submitAssessmentDueDate: exerciseData.contactIndependentAssessors.toDate(),
    uploadUrl: `https://gov.uk/upload-independent-assessments/${applicationId}`,
    exerciseMailbox: exerciseData.exerciseMailbox,
    exercisePhoneNumber: exerciseData.exercisePhoneNumber,    
  };

  // check if first assessor has already submitted an assessment
  if (applicationData.firstAssessorSubmittedAssessment === false) {
    personalizedData.assessorName = applicationData.firstAssessorFullName;
    personalizedData.assessorEmail = applicationData.firstAssessorEmail;

    await sendAssessorEmail(personalizedData, 'firstAssessor');
  }
  
  // check if second assessor has already submitted an assessment
  if (applicationData.secondAssessorSubmittedAssessment === false) {
    personalizedData.assessorName = applicationData.secondAssessorFullName;
    personalizedData.assessorEmail = applicationData.secondAssessorEmail;

    await sendAssessorEmail(personalizedData, 'secondAssessor');
  }

  // regardless of how many assessor emails were sent,
  // finish the job off by setting the status to 'assessors-requests-sent'
  setData('applications', applicationId, {status: 'assessors-requests-sent'});
  return null;
};


module.exports = {
    notifyAssessorsToAssess,
};
