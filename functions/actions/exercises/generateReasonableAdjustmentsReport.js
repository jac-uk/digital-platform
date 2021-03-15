const { getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    generateReasonableAdjustmentsReport,
  };

  async function generateReasonableAdjustmentsReport(exerciseId) {

    // get submitted applications that have reasonable adjustments
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('personalDetails.reasonableAdjustments', '==', true)
    );

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
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('reasonableAdjustments').set(report);

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
    { title: 'Name', ref: 'name' },
    { title: 'Email', ref: 'email' },
    { title: 'Phone number', ref: 'phone' },
    { title: 'Details', ref: 'details' },
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
    return {
      name: application.personalDetails.fullName || null,
      email: application.personalDetails.email || null,
      phone: application.personalDetails.phone || null,
      details: application.personalDetails.reasonableAdjustmentsDetails || null,
    };
  });
};
