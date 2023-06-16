const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocuments, getDocument } = require('../../shared/helpers');
const { applicationOpenDatePost01042023 } = require('../../shared/converters/helpers');

module.exports = (firebase, db) => {
  return {
    exportApplicationContactsData,
  };

  /**
   * Generates an export of all application contacts for the specified exercise
   * @param {*} exerciseId 
   * @param {*} status - Application status
   * @param {*} exercise 
   * @returns 
   */
  async function exportApplicationContactsData(exerciseId, status) {
    // get submitted applications
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', '==', status)
    );
    
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    const headers = {
      referenceNumber: 'Reference number',
      status: 'Status',
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

    // Add checks for different fields after 01-04-2023, remove headers accordingly
    if (applicationOpenDatePost01042023(exercise)) {
      delete headers['First Generation Student'];
    } else {
      delete headers['Parents Attended University'];
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
    // the following ensure application has sufficient fields for the export
    if (!Object.keys(application).includes('personalDetails')) { application.personalDetails = {}; }
    if (!Object.keys(application).includes('equalityAndDiversitySurvey')) { application.equalityAndDiversitySurvey = {}; }

    const returnObj = {
      referenceNumber: application.referenceNumber,
      status: lookup(application.status),
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

    // Add checks for different fields after 01-04-2023 remove rows accordingly
    if (applicationOpenDatePost01042023(exercise)) {
      delete returnObj['firstGenerationStudent'];
    } else {
      delete returnObj['parentsAttendedUniversity'];
    }    

    return returnObj;
  });
};
