const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const getData = require('../sharedServices').getData;
const slog = require('../sharedServices').slog;

const sendAssessorEmail = async (emailTemplateData) => {
  //
  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.notify_assessor_assessment_received in firebase functions like this:
  // firebase functions:config:set notify.templates.notify_assessor_assessment_received="THE_GOVUK_NOTIFY_TEMPLATE_ID"
  const templateId = functions.config().notify.templates.notify_assessor_assessment_received;

  console.log('templateId = ', templateId);
  if (templateId === null) {
    console.log('ERROR: invalid templateId: ', templateId);
    return null;
  }

  return sendEmail(emailTemplateData.assessorEmail, templateId, emailTemplateData)
    .then((sendEmailResponse) => {
      slog(`
        INFO: Notify Assessor: ${emailTemplateData.assessorName} (${emailTemplateData.assessorEmail})
        that we've received their assessment of 
        Candidate: ${emailTemplateData.applicantName} (${emailTemplateData.applicantEmail})
        against ApplicationId: ${emailTemplateData.applicationId}
      `, sendEmailResponse);

      return true;
    });
};


const notifyAssessorAssessmentReceived = async (applicationData, applicationId, whichAssessor) => {
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

  const assessorNameField = `${whichAssessor}FullName`;
  const assessorEmailField = `${whichAssessor}Email`;

  const personalizedData = {
    applicantName: candidateData.fullName,
    applicantEmail: candidateData.email,
    applicationId: applicationId,
    exerciseName: exerciseData.name,
    selectionExerciseManager: exerciseData.selectionExerciseManagerFullName,
    assessorName: applicationData[assessorNameField],
    assessorEmail: applicationData[assessorEmailField],
  };

  sendAssessorEmail(personalizedData);  

  return null;
};
  
  
module.exports = {
  notifyAssessorAssessmentReceived,
};
