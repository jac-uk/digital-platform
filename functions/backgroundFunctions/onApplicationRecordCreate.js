const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin');
const { logEvent } = require('../actions/logs/logEvent')(firebase, db);

const runtimeOptions = {
  memory: '256MB',
};

module.exports = functions.runWith(runtimeOptions).region('europe-west2').firestore
  .document('applicationRecords/{applicationRecordId}')
  .onCreate((snap, context) => {
    const applicationRecord = snap.data();
    const detail = {
      applicationRecordId: context.params.applicationRecordId,
      candidateName: applicationRecord.candidate ? applicationRecord.candidate.fullName : null,
      exerciseRef: applicationRecord.exercise.referenceNumber,
    };
    logEvent('info', 'Application Record created', detail);
  });
