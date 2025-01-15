import { getDocument, getDocuments } from '../../shared/helpers.js';

export default (firebase, db) => {
  return {
    refreshApplicationCounts,
  };

  async function refreshApplicationCounts(params) {

    const exerciseId = params.exerciseId;
    let applications = params.applications;
    let applicationRecords = params.applicationRecords;

    // get exercise
    const exerciseRef = db.collection('exercises').doc(exerciseId);
    const exercise = await getDocument(exerciseRef);
    if (!exercise) { return false; }

    // get applications
    if (!applications) {
      applications = await getDocuments(
        db.collection('applications')
          .where('exerciseId', '==', exerciseId)
          .select('status')
      );
    }

    // get application records
    if (!applicationRecords) {
      applicationRecords = await getDocuments(
        db.collection('applicationRecords')
          .where('exercise.id', '==', exerciseId)
          .select('stage', 'status', 'flags')
      );
    }

    const data = {
      _applications: applicationCounts(applications),
      _applicationRecords: applicationRecordCounts(applicationRecords),
    };

    // remove old fields from data
    if (exercise._counts) {
      data._counts = firebase.firestore.FieldValue.delete();
    }
    if (exercise.applicationsCount) {
      data.applicationsCount = firebase.firestore.FieldValue.delete();
    }
    if (exercise.applications) {
      data.applications = firebase.firestore.FieldValue.delete();
    }
    if (exercise.applicationRecords) {
      data.applicationRecords = firebase.firestore.FieldValue.delete();
    }

    await exerciseRef.update(data);
    return data;
  }

  function applicationCounts(applications) {
    const counts = {
      _total: applications.length,
      _lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    };
    applications.forEach(application => {
      if (counts[application.status]) {
        counts[application.status]++;
      } else {
        counts[application.status] = 1;
      }
    });
    return counts;
  }

  function applicationRecordCounts(applicationRecords) {
    const counts = {
      _total: applicationRecords.length,
      _lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      status: {},
    };
    applicationRecords.forEach(applicationRecord => {
      if (counts[applicationRecord.stage]) {
        counts[applicationRecord.stage]++;
      } else {
        counts[applicationRecord.stage] = 1;
      }

      const status = applicationRecord.status || 'blank';   // TODO not sure about this
      if (counts.status[status]) {
        counts.status[status]++;
      } else {
        counts.status[status] = 1;
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
  }

};
