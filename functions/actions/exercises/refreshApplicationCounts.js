const { getDocument, getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    refreshApplicationCounts,
  };

  async function refreshApplicationCounts(params) {

    const exerciseId = params.exerciseId;

    // get exercise
    const exerciseRef = db.collection('exercises').doc(exerciseId);
    const exercise = await getDocument(exerciseRef);
    if (!exercise) { return false; }

    // get applications
    const applications = await getDocuments(
      db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .select('status')
    );

    // get application records
    const applicationRecords = await getDocuments(
      db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .select('stage', 'status', 'flags')
    );

    const counts = {
      applications: applicationCounts(applications),
      applicationRecords: applicationRecordCounts(applicationRecords),
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await exerciseRef.update({ _counts: counts });
    return counts;
  }
};

const applicationCounts = (applications) => {
  const counts = {};
  applications.forEach(application => {
    if (counts[application.status]) {
      counts[application.status]++;
    } else {
      counts[application.status] = 1;
    }
  });
  return counts;
};

const applicationRecordCounts = (applicationRecords) => {
  const counts = {};
  applicationRecords.forEach(applicationRecord => {
    if (counts[applicationRecord.stage]) {
      counts[applicationRecord.stage]++;
    } else {
      counts[applicationRecord.stage] = 1;
    }
    // EMP counts
    if (applicationRecord.flags && applicationRecord.flags.empApplied) {
      const countName = `${applicationRecord.stage}EMP`;
      if (counts[countName]) {
        counts[countName]++;
      } else {
        counts[countName] = 1;
      }
    }
  });
  return counts;
};
