const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocument, getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    generateAgencyReport,
  };

  async function generateAgencyReport(exerciseId) {

    // get submitted applications that have character check declarations
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('characterChecks.consent', '==', true));

    // get report headers
    const headers = reportHeaders(exercise);

    // get report rows
    const rows = reportData(db, exercise, applications);

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
 * @param {document} exercise
 * @return {array}
 */
const reportHeaders = (exercise) => {
  const headers = [
    { title: 'Title', ref: 'title' },
    { title: 'Surname', ref: 'lastName' },
    { title: 'Forename(s)', ref: 'firstName' },
    { title: 'Previous/Any Other Names Used', ref: 'otherNames' },
    { title: 'Gender', ref: 'gender' },
    { title: 'Date of Birth', ref: 'dateOfBirth' },
    { title: 'Place of Birth (county, or country if outside of the UK)', ref: 'placeOfBirth' },
    { title: 'Current Address', ref: 'currentAddress' },
    { title: 'Postcode', ref: 'postcode' },
    { title: 'Previous Address (if you have moved within the last 5 years)', ref: 'previousAddresses' },
    { title: 'National Insurance Number', ref: 'nationalInsuranceNumber' },
    { title: 'SRA - Admission to the roll', ref: 'sraDate' },
    { title: 'SRA Number', ref: 'sraNumber' },
    { title: 'BSB - Called to the Bar', ref: 'bsbDate' },
    { title: 'BSB Number', ref: 'bsbNumber' },
  ];

  if (exercise.typeOfExercise === 'legal') {
    headers.push(
      { title: 'Where did you gain your legal qualifications', ref: 'qualifications' },
      { title: 'Date Qualified', ref: 'qualificationsDates' }
    );
  }

  headers.push(
    { title: 'Other Memberships', ref: 'otherMemberships' },
    { title: 'Juidicial Office', ref: 'jcioOffice' },
    { title: 'Juidicial Posts', ref: 'jcioPosts' },
    { title: 'VAT Registration Number', ref: 'hmrcVATNumbers' },
    { title: 'GMC - Membership Date', ref: 'gmcDate' },
    { title: 'GMC - Membership No.', ref: 'gmcNumber' },
    { title: 'RISC - Membership Date', ref: 'riscDate' },
    { title: 'RISC - Membership No.', ref: 'riscNumber' }
  );

  return headers;
};

/**
 * Get the report data
 *
 * @param {db} db
 * @param {document} exercise
 * @param {array} applications
 * @returns {array}
 */
const reportData = (db, exercise, applications) => {
  return applications.map((application) => {
    const personalDetails = application.personalDetails || {}; 
    const qualifications = application.qualifications || [];
    const sra = qualifications.find((qualification) => qualification.type === 'solicitor');
    const bsb = qualifications.find((qualification) => qualification.type === 'barrister');

    return {
      title: personalDetails.title || null,
      lastName: personalDetails.lastName || null,
      firstName: personalDetails.firstName || null,
      otherNames: personalDetails.otherNames || null,
      gender: lookup(application.equalityAndDiversitySurvey.gender),
      dateOfBirth: helpers.formatDate(personalDetails.dateOfBirth),
      placeOfBirth: personalDetails.placeOfBirth || null,
      currentAddress: personalDetails.address ? formatAddress(personalDetails.address.current) : null,
      postcode: personalDetails.address && personalDetails.address.current && personalDetails.address.current.postcode ? personalDetails.address.current.postcode : null,
      previousAddresses: getFormattedPreviousAddresses(personalDetails),
      nationalInsuranceNumber: helpers.formatNIN(personalDetails.nationalInsuranceNumber),
      sraDate: sra ? helpers.formatDate(sra.date) : null,
      sraNumber: sra ? sra.membershipNumber || null : null,
      bsbDate: bsb ? helpers.formatDate(bsb.date) : null,
      bsbNumber: bsb ? bsb.membershipNumber || null : null,
      qualifications: getFormattedQualifications(qualifications),
      qualificationsDates: getFormattedQualificationsDates(qualifications),
      otherMemberships: getFormattedOtherMemberships(exercise, application),
      jcioOffice: helpers.toYesNo(application.feePaidOrSalariedJudge) || null,
      jcioPosts: application.experience ? application.experience.map(e => e.jobTitle).join(', ') : null,
      hmrcVATNumbers: application.personalDetails.hasVATNumbers ? application.personalDetails.VATNumbers.map(e => e.VATNumber).join(', ') : null,
      gmcDate: helpers.formatDate(application.generalMedicalCouncilDate),
      gmcNumber: application.generalMedicalCouncilNumber || null,
      riscDate: helpers.formatDate(application.royalInstitutionCharteredSurveyorsDate),
      riscNumber: application.royalInstitutionCharteredSurveyorsNumber || null,
    };
  });

  /**
   * Get formatted addresses
   * 
   * @param {object} address
   * @return {string}
   */
  function formatAddress(address) {
    return `${address.street} ${address.street2} ${address.town} ${address.county}`;
  }

  /**
   * Get formatted previous addresses
   * 
   * @param {object} personalDetails
   * @return {string}
   */
  function getFormattedPreviousAddresses(personalDetails) {
    let formattedPreviousAddresses;
    if (personalDetails.address && !personalDetails.address.currentMoreThan5Years) {
      formattedPreviousAddresses = personalDetails.address.previous.map((address) => {
        const dates = `${helpers.formatDate(address.startDate)} - ${helpers.formatDate(address.endDate)}`;
        const formattedAddress = formatAddress(address);
        return `${dates} ${formattedAddress}`;
      }).join('\n');
    }
    
    return formattedPreviousAddresses || null;
  }

  /**
   * Get formatted qualifications without date
   * 
   * @param {object} qualifications
   * @return {string}
   */
  function getFormattedQualifications(qualifications) {
    return qualifications.map(qualification => {
      return [
        lookup(qualification.location),
        lookup(qualification.type),
        qualification.membershipNumber,
      ].join(' ');
    }).join('\n');
  }

  /**
   * Get formatted dates of qualifications
   * 
   * @param {object} qualifications
   * @return {string}
   */
  function getFormattedQualificationsDates(qualifications) {
    return qualifications.map(qualification => {
      return [
        helpers.formatDate(qualification.date),
      ].join(' ');
    }).join('\n');
  }

  /**
   * Get formatted other memberships
   * 
   * @param {document} exercise
   * @param {document} application
   * @return {string}
   */
  function getFormattedOtherMemberships(exercise, application) {
    const otherMemberships = [];
    if (application.professionalMemberships) {
      application.professionalMemberships.forEach(membership => {
        let formattedMembership;
        if (application.memberships[membership]) {
          const otherMembershipLabel = exercise.otherMemberships.find(m => m.value === membership).label;
          formattedMembership = `${lookup(otherMembershipLabel)}, ${helpers.formatDate(application.memberships[membership].date)}, ${application.memberships[membership].number}`;
          otherMemberships.push(formattedMembership);
        }
      });
  
    }

    return otherMemberships.join('\n');
  }
};
