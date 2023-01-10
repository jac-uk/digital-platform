const { getDocument, getDocuments } = require('../../shared/helpers');
const lookup = require('../../shared/converters/lookup');
const helpers = require('../../shared/converters/helpers');

module.exports = (firebase, db) => {
  return {
    generateStatutoryConsultationReport,
  };

  async function generateStatutoryConsultationReport(exerciseId) {
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    // get submitted applications
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', 'in', ['applied'])
    );

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
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('statutoryConsultation').set(report);

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
    { title: 'First name', ref: 'firstName' },
    { title: 'Last name', ref: 'lastName' },
    { title: 'Suffix', ref: 'suffix' },
  ];

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

    return {
      firstName: firstName || null,
      lastName: lastName || null,
      suffix: personalDetails.suffix || null,
      qualifications: getFormattedQualifications(qualifications),
      qualificationsDates: getFormattedQualificationsDates(qualifications),
    };
  });

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
};
