import * as helpers from '../../shared/converters/helpers.js';
import lookup from '../../shared/converters/lookup.js';
import { getDocument, getDocuments, getAllDocuments, objectHasNestedProperty } from '../../shared/helpers.js';
//import initApplicationConverter from '../../shared/converters/applicationConverter.js';
import initUpdateApplicationRecordStageStatus from '../applicationRecords/updateApplicationRecordStageStatus.js';
import { EXERCISE_STAGE, APPLICATION_STATUS } from '../../shared/constants.js';

//const applicationConverter = initApplicationConverter();
//const { getWelshData } = applicationConverter;

export default (firebase, db) => {
  const { convertStageToVersion2, convertStatusToVersion2 } = initUpdateApplicationRecordStageStatus(firebase, db);

  return {
    generateHandoverReport,
  };

  async function generateHandoverReport(exerciseId, forAdminDisplay = false) {

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
    const headers = reportHeaders(exercise, forAdminDisplay);

    // get report rows
    const rows = reportData(db, exercise, applicationRecords, applications, forAdminDisplay);

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
 * Prepend extra headers if the data is intended for the admin frontend
 *
 * @param {document} exercise
 * @return {array}
 */
const reportHeaders = (exercise, forAdminDisplay) => {
  let headers = [];
  if (forAdminDisplay) {
    headers = [
      { title: 'Application ID', ref: 'applicationId' },
      { title: 'Candidate ID', ref: 'candidateId' },
      { title: 'Reference Number', ref: 'referenceNumber' },
      { title: 'Full Name', ref: 'fullName' },
    ];
  }
  headers.push(...[
    { title: 'Candidate Title', ref: 'title' },
    { title: 'Candidate First Name', ref: 'firstName' },
    { title: 'Professional name', ref: 'professionalName' },
    { title: 'Candidate Last Name', ref: 'lastName' },
    { title: 'Previous known name(s)', ref: 'previousNames' },
    { title: 'Suffix', ref: 'suffix' },
    { title: 'Blank', ref: 'blank1' },
    { title: 'Date of Birth', ref: 'dateOfBirth' },
    { title: 'National Insurance Number', ref: 'nationalInsuranceNumber' },
    { title: 'Street', ref: 'street' },
    { title: 'Street2', ref: 'street2' },
    { title: 'Blank', ref: 'blank2' },
    { title: 'Blank', ref: 'blank3' },
    { title: 'Town', ref: 'town' },
    { title: 'County', ref: 'county' },
    { title: 'Postcode', ref: 'postcode' },
    { title: 'Country', ref: 'country' },         // Q
    { title: 'Phone number', ref: 'phone' },
    { title: 'Mobile number', ref: 'mobile' },
    { title: 'Email address', ref: 'email' },
    { title: 'Gender', ref: 'gender' },
    { title: 'Citizenship', ref: 'citizenship' },   // V
    { title: 'Ethnicity', ref: 'ethnicGroup' },
    { title: 'School type', ref: 'stateOrFeeSchool16' },
    { title: 'Parents attended university', ref: 'parentsAttendedUniversity' },
    { title: 'Occupation of main household earner', ref: 'occupationOfChildhoodEarner' },       // Z
    { title: 'Religion or belief', ref: 'religionFaith' },                                      // AA
    { title: 'Sexual orientation', ref: 'sexualOrientation' },
    { title: 'Blank', ref: 'blank4' },
    { title: 'Blank', ref: 'blank5' },
    { title: 'Same as sex registered at birth', ref: 'sameAsSexAtBirth' },
    { title: 'Blank', ref: 'blank6' },
    { title: 'Judicial workshadowing', ref: 'participatedInJudicialWorkshadowingScheme' },
    { title: 'Disability', ref: 'disability' },             // AH
    { title: 'Blank', ref: 'blank7' },
    { title: 'Blank', ref: 'blank8' },
    { title: 'Blank', ref: 'blank9' },
    { title: 'Blank', ref: 'blank10' },
    { title: 'Date called to the Bar', ref: 'calledToBarDate' },
    { title: 'Date qualified', ref: 'date' },                         // AN
    { title: 'Blank', ref: 'blank11' },
    { title: 'Blank', ref: 'blank12' },
    { title: 'Blank', ref: 'blank13' },
    { title: 'Blank', ref: 'blank14' },
    { title: 'Blank', ref: 'blank15' },
    { title: 'Blank', ref: 'blank16' },
    { title: 'Blank', ref: 'blank17' },
    { title: 'Blank', ref: 'blank18' },
    { title: 'Blank', ref: 'blank19' },
    { title: 'Blank', ref: 'blank20' },
    { title: 'Blank', ref: 'blank21' },
    { title: 'Agreed to share Diversity', ref: 'shareData' },
    { title: 'Part Time Working Preferences', ref: 'interestedInPartTime' },
    { title: 'Part Time Working Preferences details', ref: 'partTimeWorkingPreferencesDetails' },
    { title: 'Suitable for vacancies in Wales', ref: 'welshPosts' },
  ]);
  return headers;
};

/**
 * Get the report data for the given exercise and applications
 * Prepend extra cols if the data is intended for the admin frontend
 *
 * @param {db} db
 * @param {document} exercise
 * @param {array} applicationRecords
 * @param {array} applications
 * @returns {array}
 */
const reportData = (db, exercise, applicationRecords, applications, forAdminDisplay) => {
  return applications.map((application) => {
    const welshPosts = null;  // To be manually filled in
    const partTimeWorkingPreferences = {
      interestedInPartTime: helpers.toYesNo(application.interestedInPartTime) || '',
      partTimeWorkingPreferencesDetails: application.partTimeWorkingPreferencesDetails || '',
    };
    const shareData = application.equalityAndDiversitySurvey ? helpers.toYesNo(application.equalityAndDiversitySurvey.shareData) : null;

    // return report data for this application
    return {
      ...(forAdminDisplay ? adminDisplayFields(application) : {}),
      ...formatPersonalDetails(application.personalDetails),
      ...formatDiversityData(application.equalityAndDiversitySurvey, exercise, application.personalDetails),
      ...formatRelevantQualificationsData(application),
      shareData,
      ...partTimeWorkingPreferences,
      welshPosts,
    };
  });
};

/**
 * Fields only used for display on the admin frontend (not for download so get stripped out by the frontend)
 * @param {Object} application
 * @returns
 */
const adminDisplayFields = (application) => {
  return {
    applicationId: application.id,
    candidateId: application.userId,
    referenceNumber: application.referenceNumber,
    fullName: application.personalDetails.fullName,
  };
};

const formatPersonalDetails = (personalDetails) => {
  const address = objectHasNestedProperty(personalDetails, 'address.current') ? personalDetails.address.current : null;
  return {
    title: personalDetails.title || null,
    firstName: personalDetails.firstName || null,
    professionalName: personalDetails.professionalName || null,
    lastName: personalDetails.lastName || null,
    previousNames: personalDetails.previousNames || null,
    suffix: personalDetails.suffix || null,
    blank1: null,
    dateOfBirth: helpers.formatDate(personalDetails.dateOfBirth),
    nationalInsuranceNumber: helpers.formatNIN(personalDetails.nationalInsuranceNumber),
    street: address && address.street ? address.street : null,
    street2: address && address.street2 ? address.street2 : null,
    blank2: null,
    blank3: null,
    town: address && address.town ? address.town : null,
    county: address && address.county ? address.county : null,
    postcode: address && address.postcode ? address.postcode : null,
    country: address && address.country ? address.country : lookup(personalDetails.citizenship), // check if country is in address, if not use citizenship
    citizenship: lookup(personalDetails.citizenship),
    phone: personalDetails.phone || null,
    mobile: personalDetails.mobile || null,
    email: personalDetails.email || null,
  };
};

const formatDiversityData = (survey, exercise, personalDetails) => {
  if (!survey) return {};
  const share = (value) => survey.shareData ? value : null;

  // If (Same as sex registered at birth = Yes) value = value in column U; else if (Same as sex registered at birth = No) value = opposite of value in column U (i.e. if U = male, value = female and vice versa; else if (Same as sex registered at birth = Prefer not to say) value = Prefer not to say
  const sameAsSexRegBirth = survey.changedGender; // when changedGender is false it means they HAVEN'T changed gender, this is due to the question not aligning with the variable name!
  let sameAsSexValue = null;
  const gender = survey.gender;
  if (sameAsSexRegBirth) {
    sameAsSexValue = share(lookup(survey.gender));
  }
  else if (sameAsSexRegBirth === 'prefer-not-to-say') {
    sameAsSexValue = share(lookup('prefer-not-to-say'));
  }
  else {
    if (gender === 'male') {
      sameAsSexValue = share(lookup('female'));
    }
    else if (gender === 'female') {
      sameAsSexValue = share(lookup('male'));
    }
  }
  return {
    gender: share(lookup(survey.gender)),
    ethnicGroup: share(lookup(survey.ethnicGroup)),
    stateOrFeeSchool16: share(lookup(survey.stateOrFeeSchool16)),
    parentsAttendedUniversity: share(helpers.toYesNo(lookup(survey.parentsAttendedUniversity))),
    occupationOfChildhoodEarner: lookup(survey.occupationOfChildhoodEarner),
    religionFaith: share(lookup(survey.religionFaith)),
    sexualOrientation: share(lookup(survey.sexualOrientation)),
    blank4: null,
    blank5: null,
    sameAsSexAtBirth: sameAsSexValue,
    blank6: null,
    participatedInJudicialWorkshadowingScheme: share(helpers.toYesNo(lookup(survey.participatedInJudicialWorkshadowingScheme))),
    disability: share(helpers.toYesNo(survey.disability)),
    blank7: null,
    blank8: null,
    blank9: null,
    blank10: null,
  };
};

const formatRelevantQualificationsData = (application) => {
  const response = {
    calledToBarDate: null,
    date: null,
    blank11: null,
    blank12: null,
    blank13: null,
    blank14: null,
    blank15: null,
    blank16: null,
    blank17: null,
    blank18: null,
    blank19: null,
    blank20: null,
    blank21: null,
  };
  if (application.qualifications && Array.isArray(application.qualifications)) {
    for (const qualification of application.qualifications) {
      const qualificationType = qualification.type ? qualification.type.toLowerCase() : '';
      if (Object.prototype.hasOwnProperty.call(qualification, 'calledToBarDate')) {
        response.calledToBarDate = helpers.formatDate(qualification.calledToBarDate);
      }
      // check if solicitor and put their qualification date in
      if (Object.prototype.hasOwnProperty.call(qualification, 'date') && (qualificationType === 'solicitor' || qualificationType === 'cilex')) {
        response.date = helpers.formatDate(qualification.date);
      }
    }
  }
  return response;
};
