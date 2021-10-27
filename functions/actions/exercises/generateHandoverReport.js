const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocument, getDocuments, getAllDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    generateHandoverReport,
  };

  async function generateHandoverReport(exerciseId) {

    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    // get submitted application records (which are at the handover stage)
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('stage', '==', 'handover')
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
      { title: 'Other Names', ref: 'otherNames' },
      { title: 'Suffix', ref: 'suffix' },
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
        { title: 'School type', ref: 'stateOrFeeSchool' },
        { title: 'Attended university', ref: 'firstGenerationStudent' },
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
      qualifications = formatLegalData(application);
    } else if (exercise.typeOfExercise === 'non-legal') {
      memberships = formatNonLegalData(application, exercise);
    }

    // return report data for this application
    return {
      applicationId: application.id,
      referenceNumber: application.referenceNumber || null,
      candidateId: getCandidateId(applicationRecords, application),
      ...formatPersonalDetails(application.personalDetails),
      ...qualifications,
      ...memberships,
      ...formatDiversityData(application.equalityAndDiversitySurvey, exercise),
    };

  });
};

const getCandidateId = (applicationRecords, application) => {
  const applicationRecord = applicationRecords.find(e => e.application.id === application.id);
  return applicationRecord.candidate.id;
};

const formatPersonalDetails = (personalDetails) => {
  const formatAddress = (address =>
    `${address.street} ${address.street2} ${address.town} ${address.county} ${address.postcode} `
  );

  let formattedPreviousAddresses;
  if (personalDetails.address && !personalDetails.address.currentMoreThan5Years) {
    formattedPreviousAddresses = personalDetails.address.previous.map((address) => {
      const dates = `${helpers.formatDate(address.startDate)} - ${helpers.formatDate(address.endDate)}`;
      const formattedAddress = formatAddress(address);
      return `${dates} ${formattedAddress}`;
    }).join('\n\n');
  }

    let candidate = {
    title: personalDetails.title || null,
    otherNames: personalDetails.otherNames || null,
    suffix: personalDetails.suffix || null,
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

const formatLegalData = (application) => {
  const qualifications = application.qualifications.map(qualification => {
    return [
      lookup(qualification.location),
      lookup(qualification.type),
      helpers.formatDate(qualification.date),
      qualification.membershipNumber,
    ].join(' ');
  }).join('\n');

  let judicialExperience;
  if (application.feePaidOrSalariedJudge) {
    judicialExperience = `Fee paid or salaried judge - ${lookup(application.feePaidOrSalariedSittingDaysDetails)} days`;
  } else if (application.declaredAppointmentInQuasiJudicialBody) {
    judicialExperience = `Quasi-judicial body - ${lookup(application.quasiJudicialSittingDaysDetails)} days`;
  } else {
    judicialExperience = `Acquired skills in other way - ${lookup(application.skillsAquisitionDetails)}`;
  }

  return {
    qualifications: qualifications,
    judicialExperience: judicialExperience,
  };
};

const formatNonLegalData = (application, exercise) => {
  const organisations = {
    'chartered-association-of-building-engineers': 'charteredAssociationBuildingEngineers',
    'chartered-institute-of-building': 'charteredInstituteBuilding',
    'chartered-institute-of-environmental-health': 'charteredInstituteEnvironmentalHealth',
    'general-medical-council': 'generalMedicalCouncilDate',
    'royal-college-of-psychiatrists': 'royalCollegeOfPsychiatrist',
    'royal-institution-of-chartered-surveyors': 'royalInstitutionCharteredSurveyors',
    'royal-institute-of-british-architects': 'royalInstituteBritishArchitects',
    'other': 'otherProfessionalMemberships',
  };

  if (application.professionalMemberships) {
    const professionalMemberships = application.professionalMemberships.map(membership => {
      let formattedMembership;
      if (organisations[membership]) {
        const fieldName = organisations[membership];
        formattedMembership = `${lookup(membership)}, ${helpers.formatDate(application[`${fieldName}Date`])}, ${application[`${fieldName}Number`]} `;
      }
      if (application.memberships[membership]) {
        const otherMembershipLabel = exercise.otherMemberships.find(m => m.value === membership).label;
        formattedMembership = `${lookup(otherMembershipLabel)}, ${helpers.formatDate(application.memberships[membership].date)}, ${application.memberships[membership].number}`;
      }
      return formattedMembership;
    }).join('\n');

    return {
      professionalMemberships: professionalMemberships,
    };
  } else {
    return {
      professionalMemberships: null,
    };
  }
};
