import * as helpers from '../../shared/converters/helpers.js';
import lookup from '../../shared/converters/lookup.js';
import { getDocument, getDocuments, getAllDocuments, removeHtml } from '../../shared/helpers.js';
import { getAdditionalWorkingPreferences } from '../../shared/converters/workingPreferencesConverter.js';
import initApplicationConverter from '../../shared/converters/applicationConverter.js';
import initUpdateApplicationRecordStageStatus from '../applicationRecords/updateApplicationRecordStageStatus.js';

const applicationConverter = initApplicationConverter();
const { getWelshData } = applicationConverter;

export default (firebase, config, db) => {
  const { EXERCISE_STAGE, APPLICATION_STATUS } = config;
  const { convertStageToVersion2, convertStatusToVersion2 } = initUpdateApplicationRecordStageStatus(firebase, config, db);
  
  return {
    generateHandoverReport,
  };

  async function generateHandoverReport(exerciseId) {

    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    // get submitted application records (which are at the handover stage)
    const stage = exercise._processingVersion >= 2 ? convertStageToVersion2(EXERCISE_STAGE.HANDOVER) : EXERCISE_STAGE.HANDOVER;
    const statuses = [
      APPLICATION_STATUS.RECOMMENDED_IMMEDIATE,
      exercise._processingVersion >= 2 ?  convertStatusToVersion2(APPLICATION_STATUS.APPROVED_FOR_IMMEDIATE_APPOINTMENT) : APPLICATION_STATUS.APPROVED_FOR_IMMEDIATE_APPOINTMENT,
    ];
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('stage', '==', stage)
      .where('status', 'in', statuses)
    );

    // get the parent application records for the above
    const applicationIds = applicationRecords.map(item => item.id);
    const applicationRefs = applicationIds.map(id => db.collection('applications').doc(id));
    const applications = await getAllDocuments(db, applicationRefs);

    // get report headers
    const headers = reportHeaders(exercise);

    // get report rows
    const rows = reportData(db, exercise, applicationRecords, applications);

    // construct the report document
    const report = {
      totalApplications: applications.length,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      headers,
      rows,
    };

    // store the report document in the database
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('handover').set(report);

    // return the report in the HTTP response
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

  const headers = {
    personalDetails: [
      { title: 'Candidate ID', ref: 'candidateId'},
      { title: 'Candidate Title', ref: 'title' },
      { title: 'Candidate Name', ref: 'fullName' },
      { title: 'Middle name(s)', ref: 'middleNames' },
      { title: 'Suffix', ref: 'suffix' },
      { title: 'Previous known name(s)', ref: 'previousNames' },
      { title: 'Professional name', ref: 'professionalName' },
      { title: 'Other Names', ref: 'otherNames' },
      { title: 'Email address', ref: 'email' },
      { title: 'Date of Birth', ref: 'dateOfBirth' },
      { title: 'National Insurance Number', ref: 'nationalInsuranceNumber' },
      { title: 'Citizenship', ref: 'citizenship' },
      { title: 'Contact Address', ref: 'address' },
      { title: 'Previous addresses', ref: 'previousAddresses' },
      { title: 'Telephone number', ref: 'phone' },
    ],
    qualifications: {
      legalOrLeadership: [
        { title: 'Legal qualifications', ref: 'qualifications' },
        { title: 'Judicial experience', ref: 'judicialExperience' },
      ],
    },
    memberships: {
      title: 'Professional Memberships', ref: 'professionalMemberships' ,
    },
    diversity: {
      common: [
        { title: 'Agreed to share Diversity', ref: 'shareData' },
        { title: 'Professional Background', ref: 'professionalBackground' },
        { title: 'Previous roles', ref: 'formattedFeePaidJudicialRole' },
        { title: 'School type', ref: 'stateOrFeeSchool16' },
        { title: 'Parents attended university', ref: 'parentsAttendedUniversity' },
        { title: 'Ethnicity', ref: 'ethnicGroup' },
        { title: 'Gender', ref: 'gender' },
        { title: 'Sexual orientation', ref: 'sexualOrientation' },
        { title: 'Disability', ref: 'disability' },
        { title: 'Religion or belief', ref: 'religionFaith' },
      ],
      legalOrLeadership: [
        { title: 'Judicial workshadowing', ref: 'participatedInJudicialWorkshadowingScheme' },
        { title: 'Attended Outreach Events', ref: 'attendedOutreachEvents'},
        { title: 'PAJE', ref: 'hasTakenPAJE' },
      ],
    },
  };

  // old version equality and diversity info 
  if (!isApplicationOpenDatePost01042023(exercise)) {
    headers.diversity.common = [
      { title: 'Previous roles', ref: 'formattedFeePaidJudicialRole' },
      { title: 'School type', ref: 'stateOrFeeSchool' },
      { title: 'Parents attended university', ref: 'firstGenerationStudent' },
      { title: 'Ethnicity', ref: 'ethnicGroup' },
      { title: 'Gender', ref: 'gender' },
      { title: 'Sexual orientation', ref: 'sexualOrientation' },
      { title: 'Disability', ref: 'disability' },
      { title: 'Religion or belief', ref: 'religionFaith' },
    ];
  }

  const reportHeaders = [
    { title: 'Application ID', ref: 'applicationId' },
    { title: 'Reference Number', ref: 'referenceNumber' },
    ...headers.personalDetails,
  ];

  if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
    reportHeaders.push(...headers.qualifications.legalOrLeadership);
    reportHeaders.push(...headers.diversity.common);
    reportHeaders.push(...headers.diversity.legalOrLeadership);
  }

  if (exercise.typeOfExercise === 'non-legal') {
    reportHeaders.push(headers.memberships);
    reportHeaders.push(...headers.diversity.common);
  }

  if (exercise.typeOfExercise === 'leadership-non-legal') {
    reportHeaders.push(...headers.diversity.common);
  }

  if (exercise.isSPTWOffered) {
    reportHeaders.push(
      { title: 'Part Time Working Preferences', ref: 'interestedInPartTime' },
      { title: 'Part Time Working Preferences details', ref: 'partTimeWorkingPreferencesDetails' }
    );
  }

  // separate additional working preferences
  if (Array.isArray(exercise.additionalWorkingPreferences)) {
    exercise.additionalWorkingPreferences.forEach((additionalWorkingPreference, index) => {
      reportHeaders.push({ title: additionalWorkingPreference.question, ref: `additionalWorkingPreference${index}` });
    });
  }

  reportHeaders.push(
    { title: 'Welsh posts', ref: 'welshPosts' }
  );

  return reportHeaders;
};

/**
 * Get the report data for the given exercise and applications
 *
 * @param {db} db
 * @param {document} exercise
 * @param {array} applicationRecords
 * @param {array} applications
 * @returns {array}
 */
const reportData = (db, exercise, applicationRecords, applications) => {

  return applications.map((application) => {

    // format qualifications
    let qualifications;
    let memberships;
    if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
      qualifications = formatLegalData(exercise, application);
    } else if (exercise.typeOfExercise === 'non-legal') {
      memberships = {
        professionalMemberships: helpers.formatMemberships(application, exercise),
      };
    }

    const additionalPreferences = {};
    if (Array.isArray(application.additionalWorkingPreferences)) {
      getAdditionalWorkingPreferences(application, exercise).forEach((additionalWorkingPreference, index) => {
        additionalPreferences[`additionalWorkingPreference${index}`] = removeHtml(additionalWorkingPreference.value).replace('answer:', '').trim() || '';
      });
    }

    const welshPosts = exercise.welshRequirement
      ? getWelshData(application).map(x => `${removeHtml(x.label)}\n${removeHtml(x.value)}`).join('\n\n') : '';
    const partTimeWorkingPreferences = {
      interestedInPartTime: helpers.toYesNo(application.interestedInPartTime) || '',
      partTimeWorkingPreferencesDetails: application.partTimeWorkingPreferencesDetails || '',
    };

    // return report data for this application
    return {
      applicationId: application.id,
      referenceNumber: application.referenceNumber || null,
      candidateId: getCandidateId(applicationRecords, application),
      ...formatPersonalDetails(application.personalDetails),
      ...qualifications,
      ...memberships,
      ...formatDiversityData(application.equalityAndDiversitySurvey, exercise),
      ...additionalPreferences,
      welshPosts,
      ...partTimeWorkingPreferences,
    };

  });
};

const getCandidateId = (applicationRecords, application) => {
  const applicationRecord = applicationRecords.find(e => e.application.id === application.id);
  return applicationRecord.candidate.id;
};

const formatPersonalDetails = (personalDetails) => {
  const formatAddress = (address => {
    const result = [];
    if (address.street) result.push(address.street);
    if (address.street2) result.push(address.street2);
    if (address.town) result.push(address.town);
    if (address.county) result.push(address.county);
    if (address.postcode) result.push(address.postcode);
    return `${result.join(' ')} `;
  });

  let formattedPreviousAddresses;
  if (personalDetails.address && !personalDetails.address.currentMoreThan5Years) {
    if (personalDetails.address.previous) {
      formattedPreviousAddresses = personalDetails.address.previous.map((address) => {
        const dates = `${helpers.formatDate(address.startDate)} - ${helpers.formatDate(address.endDate)}`;
        const formattedAddress = formatAddress(address);
        return `${dates} ${formattedAddress}`;
      }).join('\n\n');  
    }
  }

  let candidate = {
    title: personalDetails.title || null,
    middleNames: personalDetails.middleNames || null,
    suffix: personalDetails.suffix || null,
    previousNames: personalDetails.previousNames || null,
    professionalName: personalDetails.professionalName || null,
    otherNames: personalDetails.otherNames || null,
    email: personalDetails.email || null,
    dateOfBirth: helpers.formatDate(personalDetails.dateOfBirth),
    nationalInsuranceNumber: helpers.formatNIN(personalDetails.nationalInsuranceNumber),
    citizenship: lookup(personalDetails.citizenship),
    address: personalDetails.address ? formatAddress(personalDetails.address.current) : null,
    previousAddresses: formattedPreviousAddresses || null,
    phone: personalDetails.phone || null,
  };

  if (personalDetails.firstName && personalDetails.lastName) {
    candidate.fullName = `${personalDetails.firstName} ${personalDetails.lastName}`;
  } else {
    candidate.fullName = personalDetails.fullName;
  }
  return candidate;
};

const formatDiversityData = (survey, exercise) => {
  if (!survey) return {};

  const share = (value) => survey.shareData ? value : null;

  let formattedFeePaidJudicialRole;
  if (survey.shareData) {
    formattedFeePaidJudicialRole = helpers.toYesNo(lookup(survey.feePaidJudicialRole));
    if (survey.feePaidJudicialRole === 'other-fee-paid-judicial-office') {
      formattedFeePaidJudicialRole = `${formattedFeePaidJudicialRole} ${survey.otherFeePaidJudicialRoleDetails}`;
    }
  }

  const formattedDiversityData = {
    shareData: helpers.toYesNo(survey.shareData),
    professionalBackground: share(survey.professionalBackground.map(position => lookup(position)).join(', ')),
    formattedFeePaidJudicialRole: formattedFeePaidJudicialRole || null,
    stateOrFeeSchool: share(lookup(survey.stateOrFeeSchool)),
    firstGenerationStudent: share(helpers.toYesNo(lookup(survey.firstGenerationStudent))),
    stateOrFeeSchool16: share(lookup(survey.stateOrFeeSchool16)),
    parentsAttendedUniversity: share(helpers.toYesNo(lookup(survey.parentsAttendedUniversity))),
    ethnicGroup: share(lookup(survey.ethnicGroup)),
    gender: share(lookup(survey.gender)),
    sexualOrientation: share(lookup(survey.sexualOrientation)),
    disability: share(survey.disability ? survey.disabilityDetails : helpers.toYesNo(survey.disability)),
    religionFaith: share(lookup(survey.religionFaith)),
  };

  if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
    formattedDiversityData.participatedInJudicialWorkshadowingScheme = share(helpers.toYesNo(lookup(survey.participatedInJudicialWorkshadowingScheme)));
    formattedDiversityData.attendedOutreachEvents = share(helpers.toYesNo(lookup(survey.attendedOutreachEvents)));
    formattedDiversityData.hasTakenPAJE = share(helpers.toYesNo(lookup(survey.hasTakenPAJE)));
  }

  return formattedDiversityData;
};

const formatLegalData = (exercise, application) => {
  let qualifications = '';
  if (application.qualifications && Array.isArray(application.qualifications)) {
    qualifications = application.qualifications.map(qualification => {
      return [
        lookup(qualification.location),
        lookup(qualification.type),
        helpers.formatDate(qualification.date),
        qualification.membershipNumber,
      ].join(' ');
    }).join('\n');
  }

  const judicialExperience = helpers.getJudicialExperienceString(exercise, application);

  return {
    qualifications: qualifications,
    judicialExperience: judicialExperience,
  };
};

function isApplicationOpenDatePost01042023(exercise) {
  const usesPre01042023Questions = ['JAC00130', 'JAC00123', 'JAC00164'].includes(exercise.referenceNumber);
  if (usesPre01042023Questions) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(exercise, 'applicationOpenDate') && exercise.applicationOpenDate.toDate() > new Date('2023-04-01');
}
