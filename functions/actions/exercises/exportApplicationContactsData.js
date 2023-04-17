const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocuments } = require('../../shared/helpers');
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

    const headers = [
      'Reference number',
      'Status',
      'Welsh Application',
      'Name',
      'Email',
      'Phone number',
      'Date of Birth',
      'National Insurance Number',
      'Gender',
      'Disability',
      'Ethnic Group',
      'Current Legal Role',
      'Professional Background',
      'Held Fee-paid Judicial Role',
      'Attended UK State School',
      'First Generation Student',
      'First Assessor Name',
      'First Assessor Email',
      'First Assessor Phone',
      'Second Assessor Name',
      'Second Assessor Email',
      'Second Assessor Phone',
      'IP address',
      'User agent',
      'Platform',
      'Timezone',
    ];

    const report = {
      headers: headers,
      rows: contactsExport(applications),
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
      firstAssessorFullName: application.firstAssessorFullName,
      firstAssessorEmail: application.firstAssessorEmail,
      firstAssessorPhone: application.firstAssessorPhone,
      secondAssessorFullName: application.secondAssessorFullName,
      secondAssessorEmail: application.secondAssessorEmail,
      secondAssessorPhone: application.secondAssessorPhone,
      ip: application.client ? application.client.ip : '',
      userAgent: application.client ? application.client.userAgent : '',
      platform: application.client ? application.client.platform : '',
      timezone: application.client ? application.client.timezone : '',
    };

    // Add checks for different fields after 01-04-2023
    if (applicationOpenDatePost01042023(exercise)) {
      returnObj.parentsAttendedUniversity = helpers.toYesNo(lookup(application.equalityAndDiversitySurvey.parentsAttendedUniversity));
    }
    else {
      returnObj.firstGenerationStudent = helpers.toYesNo(lookup(application.equalityAndDiversitySurvey.firstGenerationStudent));
    }
  });
};
