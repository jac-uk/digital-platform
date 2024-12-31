import { getDocuments } from '../../shared/helpers.js';

export default (firebase, db) => {
  return {
    generateReasonableAdjustmentsReport,
  };

  async function generateReasonableAdjustmentsReport(exerciseId) {

    // get application records that have reasonable adjustments
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('candidate.reasonableAdjustments', '==', true)
    );

    // get report headers
    const headers = reportHeaders();

    // get report rows
    const rows = await reportData(firebase, db, applicationRecords, exerciseId);

    // construct the report document
    const report = {
      totalApplications: applicationRecords.length,
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
    { title: 'RA applied to', ref: 'reason' },
    { title: 'Approval Status', ref: 'status' },
    { title: 'RA allocated', ref: 'timeAllocation' },
    { title: 'Describe RA given', ref: 'note' },
    { title: 'Most Recent Exercise', ref: 'mostRecentExercise' },
  ];
};

/**
 * Get the report data
 *
 * @param {firebase} firebase
 * @param {db} db
 * @param {array} applicationRecords
 * @param {string} exerciseId
 *  
 * @returns {array}
 */
const reportData = async (firebase, db, applicationRecords, exerciseId) => {
  const data = [];
  // get applications for personal details
  const applications = await getDocuments(db.collection('applications')
    .where('exerciseId', '==', exerciseId)
    .where('personalDetails.reasonableAdjustments', '==', true)
  );

  const idToApplication = applications.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {});

  for (const applicationRecord of applicationRecords) {
    // get personal details from application
    const application = idToApplication[applicationRecord.id] || {};
    const personalDetails = application.personalDetails || {};

    // get candidate details including RA states from applicationRecords
    const candidateDetails = applicationRecord.candidate || {};
    const reasonableAdjustmentsStates = candidateDetails.reasonableAdjustmentsStates || [];

    for (const state of reasonableAdjustmentsStates) {
      data.push({
        name: formatName(application),
        email: personalDetails.email || null,
        phone: personalDetails.phone || null,
        details: candidateDetails.reasonableAdjustmentsDetails || null,
        reason: state.reason || null,
        status: state.status || null,
        timeAllocation: state.timeAllocation || null,
        note: state.note || null,
        mostRecentExercise: application.exerciseRef,
      }); 
    }
  }

  return data;
};

function formatName(application) {
  let name = null;
  let firstName = application.personalDetails.firstName || null;
  let lastName = application.personalDetails.lastName || null;
  if ((!firstName || !lastName) && application.personalDetails.fullName) {
    const nameParts = application.personalDetails.fullName.split(' ');
    if (nameParts.length) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }
  }
  if (firstName && lastName){
    name = `${lastName}, ${firstName}`; 
  } 
  return name;
}
