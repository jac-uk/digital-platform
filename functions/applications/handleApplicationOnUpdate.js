/*eslint-disable no-unused-vars*/
const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const getData = require('../sharedServices').getData;
const slog = require('../sharedServices').slog;
const setData = require('../sharedServices').setData;
const notifyCandidatesQTResults = require('./notifyCandidatesQTResults').notifyCandidatesQTResults;
const notifyCandidatesEligibilityResult = require('./notifyCandidatesEligibilityResult').notifyCandidatesEligibilityResult;
const inviteCandidateToQT = require('./inviteCandidateToQT').inviteCandidateToQT;
const notifyCandidateTestReceived= require('./notifyCandidateTestReceived').notifyCandidateTestReceived;
const notifyAssessorsToAssess = require('./notifyAssessorsToAssess').notifyAssessorsToAssess;


const sendApplicationSubmittedEmailToCandidate = async (data, applicationId) => {
  const candidateData = await getData('candidates', data.userId);
  if (candidateData == null) {
    slog(`
      ERROR: No data returned from Candidates with docId = ${data.userId}
    `);
    return null;
  }

  const candidateEmail = candidateData.email;
  const candidateFullName = candidateData.fullName;

  const exerciseData = await getData('exercises', data.exerciseId);
  if (exerciseData == null) {
    slog(`
      ERROR: No data returned from Exercises with docId = ${data.exerciseId}
    `);
    return null;
  } 

  const personalizedData = {
    applicantName: candidateFullName,
  };

  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.application_submitted in firebase functions like this:
  // firebase functions:config:set notify.templates.application_submitted="THE_GOVUK_NOTIFY_TEMPLATE_ID"  
  const templateId = functions.config().notify.templates.application_submitted;
  return sendEmail(candidateEmail, templateId, personalizedData).then((sendEmailResponse) => {
    slog(`
      ${candidateFullName} (${candidateEmail}) has applied to exercise ${data.exerciseId}
    `);
    return true;
  });   
};


const notifyAdminAboutFlaggedApplication = async (applicationId) => {
  const applicationData = await getData('applications', applicationId);
  if (applicationData == null) {
    slog(`
      ERROR: No data returned from Applications with docId = ${applicationId}
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

  const exerciseData = await getData('exercises', applicationData.exerciseId);
  if (exerciseData == null) {
    slog(`
      ERROR: No data returned from Exercises with docId = ${applicationData.exerciseId}
    `);
    return null;
  }  

  const personalizedData = {
    exerciseReferenceNumber: applicationData.exerciseRef,
    applicantEmailAddress: candidateData.email,
    exerciseName: applicationData.exerciseName,
    applicationFlagMsg: applicationData.flag,
    applicationCloseDate: exerciseData.applicationCloseDate.toDate(), 
    exerciseId: applicationData.exerciseId,
  };
  
  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.notify_admin_about_flagged_application in firebase functions like this:
  // firebase functions:config:set notify.templates.notify_admin_about_flagged_application="THE_GOVUK_NOTIFY_TEMPLATE_ID"  
  const templateId = functions.config().notify.templates.notify_admin_about_flagged_application;
  return sendEmail(exerciseData.exerciseMailbox, templateId, personalizedData).then((sendEmailResponse) => {
    slog(`
      Notify admin ${exerciseData.exerciseMailbox} of vacancy ${applicationData.exerciseName}
      that ${candidateData.email}'s application has  been flagged.
    `);
    return true;
  });   
};


const flagApplication = async (flagMsg, applicationId) => {
  const flagData = {
    flag: flagMsg,
  };

  slog(`
    INFO: Flagging Application ${applicationId} as 
    '${flagData.flag}'.
  `);
 
  await setData('applications', applicationId, flagData);
  await notifyAdminAboutFlaggedApplication(applicationId);
  return false;  
};


const getNumberOfDaysBetween2Dates = (startDate, endDate) => {
  const timeDifference = endDate.getTime() - startDate.getTime();
  const elapsedDays = timeDifference / (1000 * 3600 * 24); 
  return parseInt(elapsedDays, 10);
};


const hasEnoughWorkExperience = (applicantWorkExperienceData, requiredExperienceLengthInYears) => {
  let totalDaysWorkExperience = 0;
  const requiredExperienceLengthInDays = parseInt(requiredExperienceLengthInYears, 10) * 365;

  for (let i = 0; i < applicantWorkExperienceData.length; i++) {
    // if end date is not filled in, use today's date
    const endDate = applicantWorkExperienceData[i].endDate;
    let endDateJS = null;
    if (endDate == null) {
      endDateJS = new Date();
    } else {
      endDateJS = endDate.toDate();
    }

    const startDate = applicantWorkExperienceData[i].startDate;
    if (startDate == null) {
      slog(`
        INFO: Not enough work experience:
        Missing required field: Start Date
      `);
      return false;      
    }

    totalDaysWorkExperience += getNumberOfDaysBetween2Dates(
      startDate.toDate(),
      endDateJS,
    );
  }

  if (totalDaysWorkExperience < requiredExperienceLengthInDays) {
    slog(`
      INFO: Not enough work experience:
      totalDaysWorkExperience = ${totalDaysWorkExperience}
      requiredExperienceLengthInDays = ${requiredExperienceLengthInDays}
    `);
    return false;
  }
  
  return true;
};


const didLawyerlyThings = (applicantWorkExperienceData) => {
  if (applicantWorkExperienceData == null) {
    slog(`
      INFO: Problem with law-related tasks:
      Applicant has 0 work experience
    `);
    return false;
  }

  for (let i = 0; i < applicantWorkExperienceData.length; i++) {
    const tasks = applicantWorkExperienceData[i].tasks;

    if (tasks == null || tasks.length === 0) {

      slog(`
        INFO: Problem with law-related tasks:
        Applicant has done 0 law-related tasks
      `);
      return false;

    } else if (tasks.length == 1 && tasks[0].includes('None of the above')) {

      slog(`
        INFO: Problem with law-related tasks:
        Applicant has marked only 'None of the above' for law-related tasks. 
      `);
      return false;

    } else if (tasks[i].includes('Acting as mediator in connection with attempts')) {

      slog(`
        INFO: Problem with law-related tasks:
        Applicant has marked 'Acting as mediator in connection with attempts 
        to resolve issues that are, or if not resolved could be, the subject of proceedings'. 
      `);
      return false;

    }
  }

  return true;
};


const isQualified = (applicantQualificationData, exerciseQualificationData) => {
  if (applicantQualificationData == null) {
    slog(`
      INFO: Not qualified as a solicitor, barrister or member of Cilex:
      Applicant has 0 qualifications
    `);
    return false;      
  }

  // Loop through the required qualilifications for this exercise
  for (let i = 0; i < exerciseQualificationData.length; i++) {
    const exerciseLawyerType = exerciseQualificationData[i];

    // Loop through the applicant's qualifications.
    // If their qualification date is valid and the lawyer types match,
    // set the applicant as 'qualified' 
    for (let j = 0; j < applicantQualificationData.length; j++) {
      const applicantLawyerType = applicantQualificationData[j].type;

      // Check for valid qualification date
      if (applicantQualificationData[j].date == null) {
        slog(`
          INFO: Not qualified as a solicitor, barrister or member of Cilex:
          Missing qualification date on qualification type ${applicantLawyerType}
        `);
        return false;        
      }

      // Check for valid qualification location
      if (applicantQualificationData[j].location == null) {
        slog(`
          INFO: Not qualified as a solicitor, barrister or member of Cilex:
          Missing qualification location on qualification type ${applicantLawyerType}
        `);
        return false;        
      }

      if (exerciseLawyerType === applicantLawyerType) {
        console.log(`PASS: ${exerciseLawyerType} = ${applicantLawyerType}`);
        return true;
      }
    }
  }

  // If you fall all the way here, it means that the applicant's qualifications
  // did not match and of the required exercise qualifications, so we return
  // isQualified = false  
  slog(`
    INFO: Not qualified as a solicitor, barrister or member of Cilex
  `);
  return false;  
};


const checkCitizenship = async (userId, applicationId) => {
  const candidateData = await getData('candidates', userId);
  if (candidateData == null) {
    slog(`
      ERROR: No data returned from Candidates with docId = ${userId}
    `);
    return false;
  } 
  
  const citizenships = candidateData.citizenship;
  if (citizenships != null && citizenships.includes('other') == false) {
    return true;
  }

  // If you fall here, there are invalid citizenships and application should be flagged
  slog(`
    ERROR: Candidate with email ${candidateData.email} has 0 citizenships or has marked 'other'
  `);
  return await flagApplication(
    `PQE: Candidate ${candidateData.email} has 0 citizenships or has marked 'other' citizenships`,
    applicationId,
  ); 
};


const checkCharacter = async (data, applicationId) => {

  if (data.conductNegligenceInvestigation != false  ||
      data.criminalConvictionCaution != false ||
      data.declaredBankrupt != false ||
      data.disqualifiedFromDriving != false ||
      data.drinkDrugMobileMotoringOffence != false ||
      data.financialDifficulties != false || 
      data.motoringOffencesAndSixPlusPoints != false ||
      data.otherCharacterIssues != false) {

      return await flagApplication(
        'PQE: has character issues',
        applicationId,
      ); 
  }

  return true;
};


const checkPostQualificationExperience = async (data, applicationId) => {
  const exerciseData = await getData('exercises', data.exerciseId);
  if (exerciseData == null) {
    return await flagApplication(
      `ERROR: No data returned from Exercises with docId = ${data.exerciseId}`, 
      applicationId,
    );
  }

  //
  // if the type of exercise is neither 'legal' nor 'leadership',
  // don't check post-qualification experience and get out
  //
  const exerciseType = exerciseData.typeOfExercise;
  if (exerciseType !== 'legal' && exerciseType !== 'leadership') {
    return true;
  }

  //
  // Check if Candidate has enough work experience
  // and if they are relevant to the vacancy
  //
  const hasEnoughWorkExperienceResponse = hasEnoughWorkExperience(
    data.experience,
    exerciseData.postQualificationExperience,
  );
  if (hasEnoughWorkExperienceResponse === false) {
    return await flagApplication(
      'PQE: Not enough work experience',
      applicationId,
    );
  }

  //
  // Check if Candidate's tasks were lawyer-type tasks
  //
  const didLawyerlyThingsResponse = didLawyerlyThings(
    data.experience,
  );
  if (didLawyerlyThingsResponse === false) {
    return await flagApplication(
      'PQE: Candidate did not do any lawyer-related tasks or Candidate selected -None of the Above- for law-related tasks',
      applicationId,
    );
  }

  //
  // Check if Candidate has the proper qualifications
  //
  const isQualifiedResponse = isQualified(
    data.qualifications,
    exerciseData.qualifications,
  );
  if (isQualifiedResponse === false) {
    return await flagApplication(
      'PQE: Not qualified as a solicitor, barrister or member of Cilex',
      applicationId,
    );    
  }  

  return true;
};


const checkReasonableLengthOfService = async (data, applicationId) => {
  const candidateData = await getData('candidates', data.userId);
  if (candidateData == null) {
    slog(`
      ERROR: No data returned from Candidates with docId = ${data.userId}
    `);
    return false;
  }

  const candidateBirthday = candidateData.dateOfBirth;
  if (candidateBirthday == null) {
    // flag applicant if they forgot to enter their date of birth
    return await flagApplication(
      `RLS: Candidate ${candidateData.email} has no birthday`,
      applicationId,
    );   
  }

  const exerciseData = await getData('exercises', data.exerciseId);
  if (exerciseData == null) {
    slog(`
      ERROR: No data returned from Exercises with docId = ${data.exerciseId}
    `);
    return false;
  }
  
  const selectionSCCDateJS = exerciseData.selectionSCCDate.toDate();
  if (candidateBirthday.toDate().getFullYear() <= selectionSCCDateJS.getFullYear() - 70) {
    // flag applicant if they are 70 years of age or older
    return await flagApplication(
      `RLS: Candidate born in ${candidateBirthday.toDate().getFullYear()}. 
      Candidate is 70 years old or older and may not be able to complete a
      reasonable length of service.`,
      applicationId,
    );     
  }

  const exerciseLengthOfService = parseInt(exerciseData.reasonableLengthService);
  const exerciseRetirementAge = parseInt(exerciseData.retirementAge);
  const maxReasonableBirthYear = parseInt(selectionSCCDateJS.getFullYear()) - exerciseRetirementAge + exerciseLengthOfService;

  // flag applicant if they were born before the maxReasonableBirthYear
  if (candidateBirthday.toDate().getFullYear() < maxReasonableBirthYear) {
    return await flagApplication(
      `RLS: Candidate born in ${candidateBirthday.toDate().getFullYear()}. 
      With the specified exercise retirement age = ${exerciseRetirementAge} and
      exercise reasonable length of service = ${exerciseLengthOfService} and 
      exercise selection SSC year = ${selectionSCCDateJS.getFullYear()},
      the candidate should be born on or after ${maxReasonableBirthYear}.`,
      applicationId,
    ); 
  }

  return true;
};


const onStatusChange = async (newData, previousData, context) => {
  // We'll only update if the status has changed.
  // This is crucial to prevent infinite loops.
  if (newData.status == previousData.status) return null;

  if (newData.status == 'applied') {
    const applicationId = context.params.applicationId;
    slog(`Application ${applicationId} status has changed 
          from ${previousData.status}
          to ${newData.status}`);

    const checkCitizenshipResponse =
      await checkCitizenship(newData.userId, applicationId);
    console.log(`Response from checkCitizenship: ${checkCitizenshipResponse}`);

    const checkCharacterResponse =
      await checkCharacter(newData, applicationId);
    console.log(`Response from checkCharacter: ${checkCharacterResponse}`);

    const checkReasonableLengthOfServiceResponse =
      await checkReasonableLengthOfService(newData, applicationId);
    console.log(`Response from checkReasonableLengthOfService: ${checkReasonableLengthOfServiceResponse}`);    

    const checkPostQualificationExperienceResponse =
      await checkPostQualificationExperience(newData, applicationId);
    console.log(`Response from checkPostQualificationExperience: ${checkPostQualificationExperienceResponse}`);

    const notifyCandidateResponse =
      await sendApplicationSubmittedEmailToCandidate(newData, applicationId);
    slog(`Response from sendApplicationSubmittedEmailToCandidate: ${notifyCandidateResponse}`);
  }
  else if (newData.status == 'invite-to-qt') {
    inviteCandidateToQT(newData, context.params.applicationId);
  }
  else if (newData.status == 'submitted-sjca-test' || newData.status == 'submitted-scenario-test') {
    notifyCandidateTestReceived(newData, context.params.applicationId);
  }
  else if (newData.status == 'request-assessors') {
    notifyAssessorsToAssess(newData, context.params.applicationId);
  }
  return null;
};


const onTestResultFieldsChange = async (newData, previousData, applicationId) => {
  // We'll only update if the sjcaTestResult or scenarioTestResult has changed.
  // This is crucial to prevent infinite loops.
  if (newData.sjcaTestResult == previousData.sjcaTestResult &&
      newData.scenarioTestResult == previousData.scenarioTestResult) return null;

  if (newData.sjcaTestResult != previousData.sjcaTestResult &&
      newData.sjcaTestResult != null) {
    notifyCandidatesQTResults(newData, applicationId, 'sjca');
  }
  
  if (newData.scenarioTestResult != previousData.scenarioTestResult &&
      newData.scenarioTestResult != null) {
    notifyCandidatesQTResults(newData, applicationId, 'scenario');
  }

  return null;
};


const onEligibilityChange = async (newData, previousData, context) => {
  // We'll only update if 'eligibility' has changed.
  // This is crucial to prevent infinite loops.
  if (newData.eligibility == previousData.eligibility) return null;

  if (newData.eligibility != null) {
    notifyCandidatesEligibilityResult(newData, context.params.applicationId);
  }

  return null;
};


exports.handleApplicationOnUpdate = functions.region('europe-west2').firestore
  .document('applications/{applicationId}')
  .onUpdate((change, context) => {
    // Retrieve the current and previous value
    const newData = change.after.data();
    const previousData = change.before.data();

    onStatusChange(newData, previousData, context);
    onTestResultFieldsChange(newData, previousData, context.params.applicationId);
    onEligibilityChange(newData, previousData, context);
    return null;
  });
