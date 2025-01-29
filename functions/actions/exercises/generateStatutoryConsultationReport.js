import { getDocument, getAllDocuments, getDocuments, formatDate, getDate } from '../../shared/helpers.js';
import lookup from '../../shared/converters/lookup.js';
import config from '../../shared/config.js';
import * as helpers from '../../shared/converters/helpers.js';

const { NOT_COMPLETE_PUPILLAGE_REASONS } = config;

export default (firebase, db) => {
  return {
    generateStatutoryConsultationReport,
  };

  async function generateStatutoryConsultationReport(exerciseId) {
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    // get submitted application with invited to selection day
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('status', 'in', ['invitedToSelectionDay', 'shortlistingOutcomePassed'])
    );
    const applicationIds = applicationRecords.map(item => item.id);
    const applicationRefs = applicationIds.map(id => db.collection('applications').doc(id));
    const applications = await getAllDocuments(db, applicationRefs);

    // get report rows
    const { maxQualificationNum, maxJudicialExperienceNum, maxNonJudicialExperienceNum, data: rows } = reportData(exercise, applications);
    // get report headers
    const headers = reportHeaders(exercise, maxQualificationNum, maxJudicialExperienceNum, maxNonJudicialExperienceNum);

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
 * @param {object} exercise
 * @param {number} maxQualificationNum
 * @param {number} maxJudicialExperienceNum
 * @param {number} maxNonJudicialExperienceNum
 * @return {array}
 */
const reportHeaders = (exercise, maxQualificationNum, maxJudicialExperienceNum, maxNonJudicialExperienceNum) => {
  const headers = [
    { title: 'First name', ref: 'firstName' },
    { title: 'Last name', ref: 'lastName' },
    { title: 'Suffix', ref: 'suffix' },
    { title: 'Previous known names', ref: 'previousNames' },
    { title: 'Professional names', ref: 'professionalName' },
    { title: 'Other names', ref: 'otherNames' },
    ...getQualificationHeaders(maxQualificationNum),
    ...getJudicialExperienceHeaders(exercise, maxJudicialExperienceNum),
    ...getNonJudicialExperienceHeaders(maxNonJudicialExperienceNum),
  ];

  if (exercise._applicationVersion < 3) {
    // only show these fields for application version 2 and below
    headers.push(...getFeePaidOrSalariedHeaders());
  }

  return headers;
};

/**
 * Get the report data
 * @param {object} exercise
 * @param {array} applications
 * @returns {array}
 */
const reportData = (exercise, applications) => {
  let maxQualificationNum = 0;
  let maxJudicialExperienceNum = 0;
  let maxNonJudicialExperienceNum = 0;

  const data = applications.map((application) => {
    const personalDetails = application.personalDetails || {};
    const qualifications = application.qualifications || [];
    const experiences = application.experience || [];
    // sort experiences by start date descending
    experiences.sort((a, b) => (getDate(b.startDate) > getDate(a.startDate)) ? 1 : -1);
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

    let res = {
      firstName: personalDetails.firstName || null,
      lastName: personalDetails.lastName || null,
      suffix: personalDetails.suffix || null,
      previousNames: personalDetails.previousNames || null,
      professionalName: personalDetails.professionalName || null,
      otherNames: personalDetails.otherNames || null,
      ...getQualificationData(qualifications),
      ...getJudicialExperienceData(exercise, application, judicialExperiences),
      ...getNonJudicialExperienceData(nonJudicialExperiences),
    };

    if (exercise._applicationVersion < 3) {
      // only show these fields for application version 2 and below
      res = { ...res, ...getFeePaidOrSalariedData(application) };
    }

    return res;
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
      { title: `${helpers.ordinal(i)} Qualification`, ref: `qualificationType${i}` },
      { title: 'Location', ref: `qualificationLocation${i}` },
      { title: 'Date completed pupillage/Date qualified', ref: `qualificationDate${i}` },
      { title: 'Has completed pupillage', ref: `completedPupillage${i}` },
      { title: 'Did not complete pupillage notes', ref: `notCompletePupillageReason${i}` }
    );
  }
  return headers;
}

function getJudicialExperienceHeaders(exercise, n) {
  const headers = [];
  for (let i = 1; i <= n; i++) {
    headers.push(
      { title: `${helpers.ordinal(i)} Judicial Role`, ref: `judicialOrgBusinessName${i}` },
      { title: 'Job title', ref: `judicialJobTitle${i}` },
      { title: 'Dates', ref: `judicialExperienceDates${i}` }
    );

    if (exercise._applicationVersion >= 3) {
      // only show these fields for application version 3 and above
      headers.push(
        { title: 'Is this a judicial or quasi-judicial post?', ref: `judicialExperienceType${i}` },
        { title: 'How many sitting days have you accumulated in this post?', ref: `judicialExperienceDuration${i}` },
        { title: 'Is a legal qualification a requisite for appointment?', ref: `judicialExperienceIsLegalQualificationRequired${i}` },
        { title: 'Powers, procedures and main responsibilities', ref: `judicialExperienceDetails${i}` }
      );
    }

    headers.push(
      { title: 'Location', ref: `judicialExperienceLocation${i}` },
      { title: 'Jurisdiction', ref: `judicialJurisdiction${i}` },
      { title: 'Working basis', ref: `judicialWorkingBasis${i}` }
    );
  }

  if (exercise._applicationVersion >= 3) {
    headers.push({ title: 'Details of how you have acquired the necessary skills', ref: 'experienceDetails' });
  }

  return headers;
}

function getNonJudicialExperienceHeaders(n) {
  const headers = [];
  for (let i = 1; i <= n; i++) {
    headers.push(
      { title: `${helpers.ordinal(i)} Organisational Business`, ref: `orgBusinessName${i}` },
      { title: 'Job title', ref: `jobTitle${i}` },
      { title: 'Dates', ref: `experienceDates${i}` },
      { title: 'Location', ref: `experienceLocation${i}` },
      { title: 'Jurisdiction', ref: `jurisdiction${i}` },
      { title: 'Working basis', ref: `workingBasis${i}` }
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

function getJudicialExperienceData(exercise, application, experiences) {
  const data = {};
  for (let i = 0; i < experiences.length; i++) {
    const experience = experiences[i];
    const index = i + 1;
    const dates = [];
    if (experience.startDate) dates.push(formatDate(experience.startDate, 'MMM YYYY'));
    if (experience.isOngoing) dates.push('Ongoing');
    else if (experience.endDate) dates.push(formatDate(experience.endDate, 'MMM YYYY'));

    data[`judicialOrgBusinessName${index}`] = experience.orgBusinessName || '';
    data[`judicialJobTitle${index}`] = experience.jobTitle || '';
    data[`judicialExperienceDates${index}`] = dates.join(' - ');

    if (exercise._applicationVersion >= 3) {
      // only show these fields for application version 3 and above
      data[`judicialExperienceType${index}`] = experience.judicialFunctions && experience.judicialFunctions.type ? lookup(experience.judicialFunctions.type) : '';
      data[`judicialExperienceDuration${index}`] = experience.judicialFunctions && experience.judicialFunctions.duration ? experience.judicialFunctions.duration : '';
      data[`judicialExperienceIsLegalQualificationRequired${index}`] = experience.judicialFunctions ? helpers.toYesNo(experience.judicialFunctions.isLegalQualificationRequired) : '';
      data[`judicialExperienceDetails${index}`] = experience.judicialFunctions && experience.judicialFunctions.details ? experience.judicialFunctions.details : '';
    }

    data[`judicialExperienceLocation${index}`] = experience.taskDetails && experience.taskDetails.location ? experience.taskDetails.location : '';
    data[`judicialJurisdiction${index}`] = experience.taskDetails && experience.taskDetails.jurisdiction ? experience.taskDetails.jurisdiction : '';
    data[`judicialWorkingBasis${index}`] = experience.taskDetails && experience.taskDetails.workingBasis ? experience.taskDetails.workingBasis : '';
  }

  if (exercise._applicationVersion >= 3) {
    data['experienceDetails'] = application.experienceDetails || '';
  }

  return data;
}

function getNonJudicialExperienceData(experiences) {
  const data = {};
  for (let i = 0; i < experiences.length; i++) {
    const experience = experiences[i];
    const index = i + 1;
    const dates = [];
    if (experience.startDate) dates.push(formatDate(experience.startDate, 'MMM YYYY'));
    if (experience.isOngoing) dates.push('Ongoing');
    else if (experience.endDate) dates.push(formatDate(experience.endDate, 'MMM YYYY'));

    data[`orgBusinessName${index}`] = experience.orgBusinessName || '';
    data[`jobTitle${index}`] = experience.jobTitle || '';
    data[`experienceDates${index}`] = dates.join(' - ');
    data[`experienceLocation${index}`] = experience.taskDetails && experience.taskDetails.location ? experience.taskDetails.location : '';
    data[`jurisdiction${index}`] = experience.taskDetails && experience.taskDetails.jurisdiction ? experience.taskDetails.jurisdiction : '';
    data[`workingBasis${index}`] = experience.taskDetails && experience.taskDetails.workingBasis ? experience.taskDetails.workingBasis : '';
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
