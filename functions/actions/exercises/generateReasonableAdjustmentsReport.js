const { getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    generateReasonableAdjustmentsReport,
  };

  async function generateReasonableAdjustmentsReport(exerciseId) {

    // get submitted applications that have reasonable adjustments
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', '==', 'applied')
      .where('personalDetails.reasonableAdjustments', '==', true)
    );

    // get report headers
    const headers = reportHeaders();

    // get report rows
    const rows = await reportData(firebase, db, applications);

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
    { title: 'Details provided by candidate', ref: 'details' },
    { title: 'Approval Status', ref: 'status' },
    { title: 'RA allocated', ref: 'timeAllocation' },
    { title: 'Describe RA given', ref: 'note' },
  ];
};

/**
 * Get the report data
 *
 * @param {firebase} firebase
 * @param {db} db
 * @param {array} applications
 * @returns {array}
 */
const reportData = async (firebase, db, applications) => {
  const data = [];
  for (const application of applications) {
    // get most recent reasonable adjustments
    const otherApplications = await getDocuments(db.collection('applications')
      .where('userId', '==', application.userId)
      .where('referenceNumber', '!=', application.referenceNumber)
      .where('personalDetails.reasonableAdjustments', '==', true)
      .orderBy('referenceNumber', 'desc')
      .orderBy('appliedAt', 'desc')
      .limit(1)
    );

    let mostRecentApplicationData = {
      mostRecentExercise: '',
      mostRecentDetails: '',
    };
    if (otherApplications && otherApplications.length) {
      const mostRecentApplication = otherApplications[0];
      mostRecentApplicationData = {
        mostRecentExercise: `${mostRecentApplication.exerciseRef} ${mostRecentApplication.exerciseName}`,
        mostRecentDetails: mostRecentApplication.personalDetails.reasonableAdjustmentsDetails,
      };
    }
    
    data.push({
      name: application.personalDetails.fullName || null,
      email: application.personalDetails.email || null,
      phone: application.personalDetails.phone || null,
      details: application.personalDetails.reasonableAdjustmentsDetails || null,
      status: application.personalDetails.reasonableAdjustmentsState.status || null,
      timeAllocation: application.personalDetails.reasonableAdjustmentsState.timeAllocation || null,
      note: application.personalDetails.reasonableAdjustmentsState.note || null,
      ...mostRecentApplicationData,
    });
  }

  return data;
};
