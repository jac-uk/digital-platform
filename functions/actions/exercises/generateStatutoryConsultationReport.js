const { getAllDocuments, getDocuments, formatDate, getDate } = require('../../shared/helpers');
const lookup = require('../../shared/converters/lookup');
const { NOT_COMPLETE_PUPILLAGE_REASONS } = require('../../shared/config');
const helpers = require('../../shared/converters/helpers');

module.exports = (firebase, db) => {
  return {
    generateStatutoryConsultationReport,
  };

  async function generateStatutoryConsultationReport(exerciseId) {
    // get submitted application with invited to selection day
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('status', '==', 'invitedToSelectionDay')
    );
    const applicationIds = applicationRecords.map(item => item.id);
    const applicationRefs = applicationIds.map(id => db.collection('applications').doc(id));
    const applications = await getAllDocuments(db, applicationRefs);

    // get report rows
    const { maxQualificationNum, maxJudicialExperienceNum, maxNonJudicialExperienceNum, data: rows } = reportData(db, applications);
    // get report headers
    const headers = reportHeaders(maxQualificationNum, maxJudicialExperienceNum, maxNonJudicialExperienceNum);

    // construct the report document
    const report = {
      totalApplications: applications.length,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      headers,
      rows,
    };

    // store the report document in the database
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('statutoryConsultation').set(report);

    // return the report in the HTTP response
    return report;
  }
};

/**
 * Get the report headers
 * 
 * @param {number} maxQualificationNum
 * @param {number} maxJudicialExperienceNum
 * @param {number} maxNonJudicialExperienceNum
 * @return {array}
 */
const reportHeaders = (maxQualificationNum, maxJudicialExperienceNum, maxNonJudicialExperienceNum) => {
  const headers = [
    { title: 'First name', ref: 'firstName' },
    { title: 'Last name', ref: 'lastName' },
    { title: 'Suffix', ref: 'suffix' },
    ...getQualificationHeaders(maxQualificationNum),
    ...getJudicialExperienceHeaders(maxJudicialExperienceNum),
    ...getNonJudicialExperienceHeaders(maxNonJudicialExperienceNum),
    ...getFeePaidOrSalariedHeaders(),
  ];

  return headers;
};

/**
 * Get the report data
 * @param {db} db
 * @param {array} applications
 * @returns {array}
 */
const reportData = (db, applications) => {
  let maxQualificationNum = 0;
  let maxJudicialExperienceNum = 0;
  let maxNonJudicialExperienceNum = 0;

  const data = applications.map((application) => {
    const personalDetails = application.personalDetails || {}; 
    const qualifications = application.qualifications || [];
    const experiences = application.experience || [];
    // sort experiences by start date descending
    experiences.sort((a, b) => getDate(b.startDate) > getDate(a.startDate));
    const judicialExperiences = [];
    const nonJudicialExperiences = [];
    experiences.forEach(experience => {
      if (Array.isArray(experience.tasks) && experience.tasks.includes('judicial-functions')) {
        judicialExperiences.push(experience);
      } else {
        nonJudicialExperiences.push(experience);
      }
    });

    maxQualificationNum = qualifications.length > maxQualificationNum ? qualifications.length : maxQualificationNum;
    maxJudicialExperienceNum = judicialExperiences.length > maxJudicialExperienceNum ? judicialExperiences.length : maxJudicialExperienceNum;
    maxNonJudicialExperienceNum = nonJudicialExperiences.length > maxNonJudicialExperienceNum ? nonJudicialExperiences.length : maxNonJudicialExperienceNum;

    return {
      firstName: personalDetails.firstName || null,
      lastName: personalDetails.lastName || null,
      suffix: personalDetails.suffix || null,
      ...getQualificationData(qualifications),
      ...getJudicialExperienceData(judicialExperiences),
      ...getNonJudicialExperienceData(nonJudicialExperiences),
      ...getFeePaidOrSalariedData(application),
    };
  });

  return {
    maxQualificationNum,
    maxJudicialExperienceNum,
    maxNonJudicialExperienceNum,
    data,
  };
};

function getQualificationHeaders(n) {
  const headers = [];
  for (let i = 1; i <= n; i++) {
    headers.push(
      { title: `${ordinal(i)} Qualification`, ref: `qualificationType${i}` },
      { title: 'Location', ref: `qualificationLocation${i}` },
      { title: 'Date completed pupillage/Date qualified', ref: `qualificationDate${i}` },
      { title: 'Has completed pupillage', ref: `completedPupillage${i}` },
      { title: 'Did not complete pupillage notes', ref: `notCompletePupillageReason${i}` }
    );
  }
  return headers;
}

function getJudicialExperienceHeaders(n) {
  const headers = [];
  for (let i = 1; i <= n; i++) {
    headers.push(
      { title: `${ordinal(i)} Judicial Role`, ref: `judicialOrgBusinessName${i}` },
      { title: 'Job title', ref: `judicialJobTitle${i}` },
      { title: 'Dates', ref: `judicialExperienceDates${i}` },
      { title: 'Location', ref: `judicialExperienceLocation${i}` },
      { title: 'Jurisdiction', ref: `judicialJurisdiction${i}` }
    );
  }
  return headers;
}

function getNonJudicialExperienceHeaders(n) {
  const headers = [];
  for (let i = 1; i <= n; i++) {
    headers.push(
      { title: `${ordinal(i)} Organisational Business`, ref: `orgBusinessName${i}` },
      { title: 'Job title', ref: `jobTitle${i}` },
      { title: 'Dates', ref: `experienceDates${i}` },
      { title: 'Location', ref: `experienceLocation${i}` },
      { title: 'Jurisdiction', ref: `jurisdiction${i}` }
    );
  }
  return headers;
}

function getFeePaidOrSalariedHeaders() {
  return [
    { title: 'Fee-paid or salaried judge', ref: 'feePaidOrSalariedJudge' },
    { title: 'Sat for at least [X] days', ref: 'feePaidOrSalariedSatForThirtyDays' },
    { title: 'Details', ref: 'feePaidOrSalariedSittingDaysDetails' },
  ];
}

function getQualificationData(qualifications) {
  const data = {};
  for (let i = 0; i < qualifications.length; i++) {
    const qualification = qualifications[i];
    const index = i + 1;
    data[`qualificationType${index}`] = lookup(qualification.type) || '';
    data[`qualificationLocation${index}`] = lookup(qualification.location) || '';
    data[`qualificationDate${index}`] = formatDate(qualification.date, 'DD/MM/YYYY') || '';
    data[`completedPupillage${index}`] = helpers.toYesNo(qualification.completedPupillage) || '';
    data[`notCompletePupillageReason${index}`] = getNotCompletePupillageReason(qualification);
  }
  return data;
}

function getNotCompletePupillageReason(qualification) {
  if (qualification.completedPupillage)
    return '';
  else if (qualification.notCompletePupillageReason === NOT_COMPLETE_PUPILLAGE_REASONS.TRANSFERRED)
    return lookup(NOT_COMPLETE_PUPILLAGE_REASONS.TRANSFERRED);
  else if (qualification.notCompletePupillageReason === NOT_COMPLETE_PUPILLAGE_REASONS.CALLED_PRE_2002)
    return lookup(NOT_COMPLETE_PUPILLAGE_REASONS.CALLED_PRE_2002);
  else if (qualification.details)
    return qualification.details;
  else
    return '';
}

function getJudicialExperienceData(experiences) {
  const data = {};
  for (let i = 0; i < experiences.length; i++) {
    const experience = experiences[i];
    const index = i + 1;
    const dates = [];
    if (experience.startDate) dates.push(formatDate(experience.startDate, 'DD/MM/YYYY'));
    if (experience.endDate) dates.push(formatDate(experience.endDate, 'DD/MM/YYYY'));

    data[`judicialOrgBusinessName${index}`] = experience.orgBusinessName || '';
    data[`judicialJobTitle${index}`] = experience.jobTitle || '';
    data[`judicialExperienceDates${index}`] = dates.join(' - ');
    data[`judicialExperienceLocation${index}`] = experience.taskDetails && experience.taskDetails.location ? experience.taskDetails.location : '';
    data[`judicialJurisdiction${index}`] = experience.taskDetails && experience.taskDetails.jurisdiction ? experience.taskDetails.jurisdiction : '';
  }
  return data;
}

function getNonJudicialExperienceData(experiences) {
  const data = {};
  for (let i = 0; i < experiences.length; i++) {
    const experience = experiences[i];
    const index = i + 1;
    const dates = [];
    if (experience.startDate) dates.push(formatDate(experience.startDate, 'DD/MM/YYYY'));
    if (experience.endDate) dates.push(formatDate(experience.endDate, 'DD/MM/YYYY'));

    data[`orgBusinessName${index}`] = experience.orgBusinessName || '';
    data[`jobTitle${index}`] = experience.jobTitle || '';
    data[`experienceDates${index}`] = dates.join(' - ');
    data[`experienceLocation${index}`] = experience.taskDetails && experience.taskDetails.location ? experience.taskDetails.location : '';
    data[`jurisdiction${index}`] = experience.taskDetails && experience.taskDetails.jurisdiction ? experience.taskDetails.jurisdiction : '';
  }
  return data;
}

function getFeePaidOrSalariedData(application) {
  const data = {};
  data['feePaidOrSalariedJudge'] = helpers.toYesNo(application.feePaidOrSalariedJudge) || '';
  data['feePaidOrSalariedSatForThirtyDays'] = helpers.toYesNo(application.feePaidOrSalariedSatForThirtyDays) || '';
  data['feePaidOrSalariedSittingDaysDetails'] = application.feePaidOrSalariedSittingDaysDetails || '';
  return data;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
