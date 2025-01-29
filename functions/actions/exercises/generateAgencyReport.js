import * as helpers from '../../shared/converters/helpers.js';
import lookup from '../../shared/converters/lookup.js';
import { getDocument, getDocuments } from '../../shared/helpers.js';

export default (firebase, db) => {
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
    const headers = reportHeaders(exercise, applications);

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
const reportHeaders = (exercise, applications) => {
  const headers = [
    { title: 'JAC Reference', ref: 'applicationReferenceNumber' },
    { title: 'Title', ref: 'title' },
    { title: 'First Name', ref: 'firstName' },
    { title: 'Middle name(s)', ref: 'middleNames' },
    { title: 'Last Name or Company Name', ref: 'lastName' },
    { title: 'Suffix', ref: 'suffix' },
    { title: 'Previous known name(s)', ref: 'previousNames' },
    { title: 'Professional names', ref: 'professionalName' },
    { title: 'Any Other Names used:', ref: 'otherNames' },
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
    const bsb = qualifications.find((qualification) => qualification.type === 'barrister' 
                                    || (qualification.type && qualification.type.includes('advocate')));

    let firstName = personalDetails.firstName;
    let lastName = personalDetails.lastName;
    let fullName = personalDetails.fullName;
    if (!firstName && !lastName && fullName) {
      const names = fullName.split(' ');
      if (names.length > 1) {
        firstName = names.shift();
      }
      lastName = names.join(' ');
    }

    // for JCIO report
    const judicialFunctionExperiences = findJudicialFunctionExperiences(application.experience);
    const anyJudicialFunctionExperiences = judicialFunctionExperiences.length > 0;
    const judicialFunctionPosts = judicialFunctionExperiences.map((exp) => exp.jobTitle);

    const data = {
      title: personalDetails.title || null,
      fullName: fullName || null,
      lastName: lastName || null,
      firstName: firstName || null,
      middleNames: personalDetails.middleNames || null,
      suffix: personalDetails.suffix || null,
      previousNames: personalDetails.previousNames || null,
      professionalName: personalDetails.professionalName || null,
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
      sraQualifications: qualifications.filter(e => e.type === 'solicitor').map(e => { return { type: e.type, location: e.location, membershipNumber: e.membershipNumber }; }),
      bsbQualifications: qualifications.filter(e => e.type === 'barrister' || (e.type && e.type.includes('advocate'))).map(e => { return { type: e.type || '', location: e.location || '', membershipNumber: e.membershipNumber || '' }; }),
      otherMemberships: getFormattedOtherMemberships(exercise, application),
      jcioOffice: helpers.toYesNo(anyJudicialFunctionExperiences) || null,
      jcioPosts: anyJudicialFunctionExperiences ? judicialFunctionPosts.join(', ') : null,
      hmrcVATNumbers: application.personalDetails.hasVATNumbers ? application.personalDetails.VATNumbers.map(e => e.VATNumber).join(', ') : null,
      gmcDate: helpers.formatDate(application.generalMedicalCouncilDate),
      gmcNumber: application.generalMedicalCouncilNumber || null,
      riscDate: helpers.formatDate(application.royalInstitutionCharteredSurveyorsDate),
      riscNumber: application.royalInstitutionCharteredSurveyorsNumber || null,
      applicationId: application.id,
      applicationReferenceNumber: application.referenceNumber,
      applicationStatus: application.status,
    };


    for (let i = 0; i < data.sraQualifications.length; i++) {
      const membershipNumber = data.sraQualifications[i].membershipNumber;
      data[`sraType${i+1}`] = data.sraQualifications[i].type;
      data[`sraRegion${i+1}`] = data.sraQualifications[i].location;
      data[`sraRegistrationNumber${i+1}`] = membershipNumber ? `${membershipNumber}` : null;
    }

    for (let i = 0; i < data.bsbQualifications.length; i++) {
      const membershipNumber = data.bsbQualifications[i].membershipNumber;
      data[`bsbType${i+1}`] = data.bsbQualifications[i].type;
      data[`bsbRegion${i+1}`] = data.bsbQualifications[i].location;
      data[`bsbRegistrationNumber${i+1}`] = membershipNumber ? `${membershipNumber}` : null;
    }

    return data;
  });

  /**
   * Get formatted addresses
   * 
   * @param {object} address
   * @return {string}
   */
  function formatAddress(address) {
    const result = [];
    if (address.street) {
      result.push(address.street);
    }
    if (address.street2) {
      result.push(address.street2);
    }
    if (address.town) {
      result.push(address.town);
    }
    if (address.county) {
      result.push(address.county);
    }

    return result.join(' ');
  }

  /**
   * Get formatted previous addresses
   * 
   * @param {object} personalDetails
   * @return {string}
   */
  function getFormattedPreviousAddresses(personalDetails) {
    let formattedPreviousAddresses;
    if (personalDetails.address && !personalDetails.address.currentMoreThan5Years && Array.isArray(personalDetails.address.previous)) {
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

  /**
   * 
   * Check the if any 'The carrying out of judicial functions in any court or tribunal' as a relevant law related task is selected in the post qualification experience
   * 
   * @param {array} experiences 
   * @returns {array}
   */
  function findJudicialFunctionExperiences(experiences) {
    if (!Array.isArray(experiences)) {
      return [];
    }

    return experiences.filter((exp) => {
      const tasks = exp.tasks;
      if (!Array.isArray(tasks)) {
        return false;
      }
      return tasks.some((t) => t === 'judicial-functions');
    }); 
  }
};
