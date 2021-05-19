const functions = require('firebase-functions');
const { firebase, db } = require('../shared/admin');
const { logEvent } = require('../actions/logs/logEvent')(firebase, db);


module.exports = functions.region('europe-west2').firestore
  .document('applications/{applicationId}')
  .onDelete((snap, context) => {

    const deletedApplication = snap.data();
    deletedApplication.deletedAt = firebase.firestore.Timestamp.fromDate(new Date());
    db.collection('applications_deleted').doc(snap.id).set(deletedApplication);

    const detail = {
      applicationId: snap.id,
      candidateName: deletedApplication.personalDetails ? deletedApplication.personalDetails.fullName : null,
      exerciseRef: deletedApplication.exerciseRef,
    };

    logEvent('info', 'Application Record deleted', detail);

  });

