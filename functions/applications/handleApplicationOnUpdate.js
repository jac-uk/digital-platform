/*eslint-disable no-unused-vars*/
const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const db = require('../sharedServices').db;
const getData = require('../sharedServices').getData;
const slog = require('../sharedServices').slog;
const setData = require('../sharedServices').setData;

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
  if (candidateData == null) {
    slog(`
      ERROR: No data returned from Exercises with docId = ${data.exerciseId}
    `);
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
    slog(`
      ${candidateFullName} (${candidateEmail}) has applied to vacancy ${exerciseName}
    `);
    return true;
  });   
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
    totalDaysWorkExperience += getNumberOfDaysBetween2Dates(
      applicantWorkExperienceData[i].startDate.toDate(),
      applicantWorkExperienceData[i].endDate.toDate(),
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

const checkPostQualificationExperience = async (data, applicationId) => {
  const exerciseData = await getData('exercises', data.exerciseId);
  if (exerciseData == null) {
    slog(`
      ERROR: No data returned from Exercises with docId = ${data.exerciseId}
    `);
    return false;
  }

  // if the type of exercise is neither 'legal' nor 'leadership',
  // don't check post-qualification experience and get out
  const exerciseType = exerciseData.typeOfExercise;
  if (exerciseType !== 'legal' && exerciseType !== 'leadership') {
    return true;
  }

  // initialize this object and fill it in if there are any flags
  // against all the checks we are doing
  let flagData = {};

  //
  // Check if Candidate has the proper qualifications
  //
  const isQualifiedResponse = isQualified(
    data.qualifications,
    exerciseData.qualifications,
  );

  if (isQualifiedResponse === false) {
    flagData['flag'] = 'Not qualified as a solicitor, barrister or member of Cilex';

    slog(`
      INFO: Flagging Application ${applicationId}
      as '${flagData['flag']}'.
    `);
   
    await setData('applications', applicationId, flagData);
    return false;
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
    flagData['flag'] = 'Not enough work experience';
  
    slog(`
      INFO: Flagging Application ${applicationId}
      as '${flagData['flag']}'.
    `);
   
    await setData('applications', applicationId, flagData);
    return false;
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

    const checkPostQualificationExperienceResponse =
      await checkPostQualificationExperience(newData, applicationId);
    console.log(`Response from checkPostQualificationExperience: ${checkPostQualificationExperienceResponse}`);

    const notifyCandidateResponse =
      await sendApplicationSubmittedEmailToCandidate(newData, applicationId);
    slog(`Response from sendApplicationSubmittedEmailToCandidate: ${notifyCandidateResponse}`);
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
    return null;
  });
