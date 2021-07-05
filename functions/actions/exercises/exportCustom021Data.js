const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocuments, getDocument } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    exportCustom021Data,
  };

  /**
   * Generates an export of all application contacts for the specified exercise
   * @param {uuid} exerciseId
   */
  async function exportCustom021Data(exerciseId) {

    // get submitted applicationRecords
    // const applicationRecords = [];
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('stage', '==', 'recommended')
    ).then((res) => {
      return res;
    });

    let applications = [];
    applicationRecords.forEach(async (a, i) => {
      console.log(applicationRecords[i] === a);
      applications.push(await getDocument(db.collection('applications').doc(a.id))
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log('err', err);
        return;
      }));
    });
    
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
      'First-tier Tribunal, ranked preference',
    ];
    
    const report = {
      headers: headers,
      rows: contactsExport(applications, applicationRecords),
    };
    
    return report;
  }

};

const contactsExport = (applications, applicationRecords) => {
  // console.log('applicationRecords', applicationRecords[0]);
  // console.log('application', applications[0]);
  return applications.map((application, index) => {
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
      // additional: application.,
    };
  });
};
