const helpers = require('../../shared/converters/helpers');
const { getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    generateAgencyReport,
  };

  async function generateAgencyReport(exerciseId) {

    // get submitted applications that have character check declarations
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('characterChecks.declaration', '==', true));

    // get report headers
    const headers = reportHeaders();

    // get report rows
    const rows = reportData(db, applications);

    // construct the report document
    const report = {
      totalApplications: applications.length,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      headers,
      rows,
    };

    // store the report document in the database
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('agency').set(report);

    // return the report in the HTTP response
    return report;
  }
};

/**
 * Get the report headers
 *
 * @return {array}
 */
const reportHeaders = () => {

  return [
    { title: 'Name', ref: 'fullName' },
    { title: 'Date of Birth', ref: 'dateOfBirth' },
    { title: 'Place of Birth', ref: 'placeOfBirth' },
    { title: 'NI No.', ref: 'nationalInsuranceNumber' },
    { title: 'SRA - Admission to the roll', ref: 'sraDate' },
    { title: 'SRA - Registration No.', ref: 'sraNumber' },
    { title: 'BSB - Called to the Bar', ref: 'bsbDate' },
    { title: 'BSB - Registration No.', ref: 'bsbNumber' },
    { title: 'JCIO - Juidicial Office', ref: 'jcioOffice' },
    { title: 'JCIO - Juidicial Posts', ref: 'jcioPosts' },
    { title: 'HMRC - VAT Number(s)', ref: 'hmrcVATNumbers' },
    { title: 'GMC - Membership Date', ref: 'gmcDate' },
    { title: 'GMC - Membership No.', ref: 'gmcNumber' },
    { title: 'RISC - Membership Date', ref: 'riscDate' },
    { title: 'RISC - Membership No.', ref: 'riscNumber' },
  ];
};

/**
 * Get the report data
 *
 * @param {db} db
 * @param {array} applications
 * @returns {array}
 */
const reportData = (db, applications) => {
  return applications.map((application) => {
    const qualifications = application.qualifications || [];
    const sra = qualifications.find((qualification) => qualification.type === 'solicitor');
    const bsb = qualifications.find((qualification) => qualification.type === 'barrister');

    return {
      fullName: application.personalDetails.fullName || null,
      dateOfBirth: helpers.formatDate(application.personalDetails.dateOfBirth),
      placeOfBirth: application.personalDetails.placeOfBirth || null,
      nationalInsuranceNumber: helpers.formatNIN(application.personalDetails.nationalInsuranceNumber),
      sraDate: sra ? helpers.formatDate(sra.date) : null,
      sraNumber: sra ? sra.membershipNumber || null : null,
      bsbDate: bsb ? helpers.formatDate(bsb.date) : null,
      bsbNumber: bsb ? bsb.membershipNumber || null : null,
      jcioOffice: helpers.toYesNo(application.feePaidOrSalariedJudge),
      jcioPosts: application.experience ? application.experience.map(e => e.jobTitle).join(', ') : null,
      hmrcVATNumbers: application.personalDetails.hasVATNumbers ? application.personalDetails.VATNumbers.map(e => e.VATNumber).join(', ') : null,
      gmcDate: helpers.formatDate(application.generalMedicalCouncilDate),
      gmcNumber: application.generalMedicalCouncilNumber || null,
      riscDate: helpers.formatDate(application.royalInstitutionCharteredSurveyorsDate),
      riscNumber: application.royalInstitutionCharteredSurveyorsNumber || null,
    };
  });
};
