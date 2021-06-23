const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    exportApplicationContactsData,
  };

  /**
   * Generates an export of all application contacts for the specified exercise
   * @param {uuid} exerciseId
   * @param {string} status - Application status
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
    ];

    const report = {
      headers: headers,
      rows: contactsExport(applications),
    };

    return report;
  }
};

const contactsExport = (applications) => {
  return applications.map((application) => {
    // the following ensure application has sufficient fields for the export
    if (!Object.keys(application).includes('personalDetails')) { application.personalDetails = {}; }
    if (!Object.keys(application).includes('equalityAndDiversitySurvey')) { application.equalityAndDiversitySurvey = {}; }
    return {
      referenceNumber: application.referenceNumber,
      status: lookup(application.status),
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
      attendedUKStateSchool: helpers.toYesNo(helpers.attendedUKStateSchool(application.equalityAndDiversitySurvey)),
      firstGenerationStudent: helpers.toYesNo(lookup(application.equalityAndDiversitySurvey.firstGenerationStudent)),
      firstAssessorFullName: application.firstAssessorFullName,
      firstAssessorEmail: application.firstAssessorEmail,
      firstAssessorPhone: application.firstAssessorPhone,
      secondAssessorFullName: application.secondAssessorFullName,
      secondAssessorEmail: application.secondAssessorEmail,
      secondAssessorPhone: application.secondAssessorPhone,
    };
  });
};
