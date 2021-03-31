const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin');
const { logEvent }  = require('../actions/logs/logEvent');

module.exports = functions.region('europe-west2').firestore
  .document('applicationRecords/{applicationRecordId}')
  .onCreate((snap, context) => {
    const applicationRecord = snap.data();
    const detail = {
      id: applicationRecordId,
      candidateName: applicationRecord.candidate.fullName,
      exerciseRef: applicationRecord.exercise.referenceNumber,
    };
    logEvent('info', 'Application Record created', detail, null);
  });
