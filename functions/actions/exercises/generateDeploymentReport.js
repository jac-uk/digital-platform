const { getDocument, getDocuments, getAllDocuments } = require('../../shared/helpers');
const { Timestamp } = require('firebase-admin/firestore');
module.exports = (config, db) => {
  const { EXERCISE_STAGE, APPLICATION_STATUS } = config;
  const { convertStageToVersion2, convertStatusToVersion2 } = require('../applicationRecords/updateApplicationRecordStageStatus')(config, db);

  return {
    generateDeploymentReport,
  };

  async function generateDeploymentReport(exerciseId) {
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    // get submitted application records (which are at the handover stage)
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('stage', '==', exercise._processingVersion >= 2 ? convertStageToVersion2(EXERCISE_STAGE.HANDOVER) : EXERCISE_STAGE.HANDOVER)
      .where('status', '==', exercise._processingVersion >= 2 ?  convertStatusToVersion2(APPLICATION_STATUS.APPROVED_FOR_IMMEDIATE_APPOINTMENT) : APPLICATION_STATUS.APPROVED_FOR_IMMEDIATE_APPOINTMENT)
    );

    // get the parent application records for the above
    const applicationIds = applicationRecords.map(item => item.id);
    const applicationRefs = applicationIds.map(id => db.collection('applications').doc(id));
    const applications = await getAllDocuments(db, applicationRefs);

    const headers = reportHeaders(exercise);
    const rows = reportData(exercise, applications, applicationRecords);

    const report = {
      totalApplications: applications.length,
      createdAt: Timestamp.fromDate(new Date()),
      headers,
      rows,
    };
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('deployment').set(report);

    return report;
  }
};

/**
 * Get the report headers for the given exercise
 *
 * @param {document} exercise
 * @return {array}
 */
const reportHeaders = (exercise) => {
  const reportHeaders = [
    { title: 'Merit Order', ref: 'meritOrder'}, // placeholder column
    { title: 'Surname', ref: 'lastName'},
    { title: 'Forename', ref: 'firstName'},
    { title: 'Home Postcode', ref: 'postcode'},
    ...getWorkingPreferenceHeaders(exercise.locationQuestionType, exercise.locationQuestionAnswers),
    { title: 'Suitable for a post in Wales', ref: 'suitableForWales'}, // placeholder column
    ...getWorkingPreferenceHeaders(exercise.jurisdictionQuestionType, exercise.jurisdictionQuestionAnswers),
  ];

  return reportHeaders;
};

/**
 * Get the report data for the given applications
 *
 * @param {object} exercise
 * @param {array} applicationRecords
 * @param {array} applications
 * @returns {array}
 */
const reportData = (exercise, applications, applicationRecords) => {

  return applications.map((application) => {
    const result = {
      applicationId: application.id,
      referenceNumber: application.referenceNumber || null,
      candidateId: getCandidateId(applicationRecords, application),
      ...formatPersonalDetails(application.personalDetails),
      ...getWorkingPreferenceData(exercise.locationQuestionType, application.locationPreferences),
      ...getWorkingPreferenceData(exercise.jurisdictionQuestionType, application.jurisdictionPreferences),
    };

    return result;

  });
};

const getCandidateId = (applicationRecords, application) => {
  const applicationRecord = applicationRecords.find(e => e.application.id === application.id);
  return applicationRecord.candidate.id;
};

const formatPersonalDetails = (personalDetails) => {
  let candidate = {
    firstName: personalDetails.firstName || null,
    lastName: personalDetails.lastName || null,
    email: personalDetails.email || null,
    postcode: personalDetails.address && personalDetails.address.current && personalDetails.address.current.postcode ? personalDetails.address.current.postcode : null,
  };

  if (personalDetails.firstName && personalDetails.lastName) {
    candidate.fullName = `${personalDetails.firstName} ${personalDetails.lastName}`;
  } else {
    candidate.fullName = personalDetails.fullName;
  }
  return candidate;
};

const getWorkingPreferenceHeaders = (type, questionAnswers) => {
  if (!Array.isArray(questionAnswers)) return [];

  const headers = [];

  switch (type) {
    case 'single-choice':
    case 'multiple-choice':
    case 'ranked-choice':
      questionAnswers.forEach((questionAnswer) => {
        headers.push({ title: questionAnswer.answer, ref: questionAnswer.answer });
      });
      break;
    default:
  }

  return headers;
};

const getWorkingPreferenceData = (type, answers) => {
  const result = {};

  switch (type) {
    case 'single-choice':
      result[answers] = 'Yes';
      break;
    case 'multiple-choice':
      Array.isArray(answers) && answers.forEach((answer, index) => {
        result[answer] = 'Yes';
      });
      break;
    case 'ranked-choice':
      Array.isArray(answers) && answers.forEach((answer, index) => {
        result[answer] = index + 1;
      });
      break;
    default:
  }

  return result;
};
