import * as helpers from '../../shared/converters/helpers.js';
import lookup from '../../shared/converters/lookup.js';
import { getDocuments, getDocument } from '../../shared/helpers.js';
import { applicationOpenDatePost01042023 } from'../../shared/converters/helpers.js';

export default (firebase, db) => {
  return {
    exportApplicationContactsData,
  };

  /**
   * Generates an export of all application contacts for the specified exercise
   * @param {*} exerciseId 
   * @param {*} status - Application status
   * @param {*} processingStage - Processing stage (optional)
   * @param {*} processingStatus - Processing status (optional)
   * @returns 
   */
  async function exportApplicationContactsData(params) {
    // get submitted applications
    let applicationsRef = db.collection('applications')
      .where('exerciseId', '==', params.exerciseId)
      .where('status', '==', params.status);
    if (params.processingStage) {
      applicationsRef = applicationsRef.where('_processing.stage', '==', params.processingStage);
    }
    if (params.processingStatus) {
      applicationsRef = applicationsRef.where('_processing.status', '==', params.processingStatus);
    }
    const applications = await getDocuments(applicationsRef);

    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(params.exerciseId));        

    const headers = {
      referenceNumber: 'Reference number',
      status: 'Status',
      processingStage: 'Processing stage',
      processingStatus: 'Processing status',
      isWelsh: 'Welsh Application',
      fullName: 'Name',
      email: 'Email',
      phone: 'Phone number',
      dob: 'Date of Birth',
      nationalInsuranceNumber: 'National Insurance Number',
      gender: 'Gender',
      disability: 'Disability',
      ethnicGroup: 'Ethnic Group',
      currentLegalRole: 'Current Legal Role',
      professionalBackground: 'Professional Background',
      heldFeePaidJudicialRole: 'Held Fee-paid Judicial Role',
      attendedUKStateSchool: 'Attended UK State School',
      firstGenerationStudent: 'First Generation Student',
      parentsAttendedUniversity: 'Parents Attended University',
      firstAssessorFullName: 'First Assessor Name',
      firstAssessorEmail: 'First Assessor Email',
      firstAssessorPhone: 'First Assessor Phone',
      secondAssessorFullName: 'Second Assessor Name',
      secondAssessorEmail: 'Second Assessor Email',
      secondAssessorPhone: 'Second Assessor Phone',
      ip: 'IP address',
      userAgent: 'User agent',
      platform: 'Platform',
      timezone: 'Timezone',
    };
    if (exercise.locationQuestion) {
      headers.locationPreferences = 'Location preferences';
    }
    if (exercise.jurisdictionQuestion) {
      headers.jurisdictionPreferences = 'Jurisdiction preferences';
    }
    if (exercise.additionalWorkingPreferences) {
      exercise.additionalWorkingPreferences.forEach((pref, index) => headers[`additionalPreference${index}`] = pref.question);
    }

    // Add checks for different fields after 01-04-2023, remove headers accordingly
    if (applicationOpenDatePost01042023(exercise)) {
      delete headers['First Generation Student'];
    } else {
      delete headers['Parents Attended University'];
    }

    if (exercise.typeOfExercise === 'non-legal') {
      headers['professionalMemberships'] = 'Professional Memberships';
    }

    const report = {
      headers: headers,
      rows: contactsExport(applications, exercise),
    };

    return report;
  }
};

const contactsExport = (applications, exercise) => {
  return applications.map((application) => {
    // the following ensures application has sufficient fields for the export
    if (!Object.keys(application).includes('personalDetails')) { application.personalDetails = {}; }
    if (!Object.keys(application).includes('equalityAndDiversitySurvey')) { application.equalityAndDiversitySurvey = {}; }

    const returnObj = {
      referenceNumber: application.referenceNumber,
      status: lookup(application.status),
      processingStage: application._processing ? application._processing.stage: '',
      processingStatus: application._processing ? application._processing.status: '',
      isWelsh: helpers.toYesNo(application._language === 'cym'),
      fullName: application.personalDetails.fullName,
      email: application.personalDetails.email,
      phone: application.personalDetails.phone,
      dob: helpers.formatDate(application.personalDetails.dateOfBirth),
      nationalInsuranceNumber: helpers.formatNIN(application.personalDetails.nationalInsuranceNumber),
      gender: lookup(application.equalityAndDiversitySurvey.gender),
      disability: helpers.toYesNo(lookup(application.equalityAndDiversitySurvey.disability)),
      ethnicGroup: lookup(application.equalityAndDiversitySurvey.ethnicGroup),
      currentLegalRole: helpers.flattenCurrentLegalRole(application.equalityAndDiversitySurvey),
      professionalBackground: helpers.flattenProfessionalBackground(application.equalityAndDiversitySurvey),
      heldFeePaidJudicialRole: helpers.heldFeePaidJudicialRole(application.equalityAndDiversitySurvey.feePaidJudicialRole),
      attendedUKStateSchool: helpers.toYesNo(helpers.attendedUKStateSchool(application.equalityAndDiversitySurvey, exercise)),
      parentsAttendedUniversity: helpers.toYesNo(lookup(application.equalityAndDiversitySurvey.parentsAttendedUniversity)),
      firstGenerationStudent: helpers.toYesNo(lookup(application.equalityAndDiversitySurvey.firstGenerationStudent)),
      firstAssessorFullName: application.firstAssessorFullName,
      firstAssessorEmail: application.firstAssessorEmail,
      firstAssessorPhone: application.firstAssessorPhone,
      secondAssessorFullName: application.secondAssessorFullName,
      secondAssessorEmail: application.secondAssessorEmail,
      secondAssessorPhone: application.secondAssessorPhone,
      ip: application.client ? application.client.ip : 'No Data',
      userAgent: application.client ? application.client.userAgent : 'No Data',
      platform: application.client ? application.client.platform : 'No Data',
      timezone: application.client ? application.client.timezone : 'No Data',
    };

    if (exercise.locationQuestion) {
      returnObj.locationPreferences = getPreferenceValueAsString(exercise.locationQuestionType, application.locationPreferences);
    }
    if (exercise.jurisdictionQuestion) {
      returnObj.jurisdictionPreferences = getPreferenceValueAsString(exercise.jurisdictionQuestionType, application.jurisdictionPreferences);
    }
    if (exercise.additionalWorkingPreferences) {
      exercise.additionalWorkingPreferences.forEach((pref, index) => {
        returnObj[`additionalPreference${index}`] = getPreferenceValueAsString(pref.questionType, additionalWorkingPreferenceAnswer(application.additionalWorkingPreferences, index));
      });
    }

    // Add checks for different fields after 01-04-2023 remove rows accordingly
    if (applicationOpenDatePost01042023(exercise)) {
      delete returnObj['firstGenerationStudent'];
    } else {
      delete returnObj['parentsAttendedUniversity'];
    }

    if (exercise.typeOfExercise === 'non-legal') {
      returnObj.professionalMemberships = helpers.formatMemberships(application, exercise);
    }

    return returnObj;
  });
};

const getPreferenceValueAsString = (type, value) => {
  if (!value) return '';
  switch (type) {
    case 'single-choice':
      return value;
    case 'multiple-choice':
      return value.join('\n');
    case 'ranked-choice':
      return value.map((v,i) => `${i+1}: ${v}`).join('\n');
  }
  return '';
};

const additionalWorkingPreferenceAnswer = (preferences, index) => {
  let result = null;
  if (preferences) {
    if (preferences[index]) {
      result = preferences[index].selection;
    }
  }
  return result;
};
