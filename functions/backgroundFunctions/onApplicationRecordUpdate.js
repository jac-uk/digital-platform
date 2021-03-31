const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { onApplicationRecordUpdate } = require('../actions/applicationRecords')(config, firebase, db);
const { logEvent }  = require('../actions/logs/logEvent');

module.exports = functions.region('europe-west2').firestore
  .document('applicationRecords/{applicationRecordId}')
  .onUpdate(async (change, context) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();

    if (dataBefore.stage !== dataAfter.stage) {
      const detail = {
        id: applicationRecordId,
        candidateName: applicationRecord.candidate.fullName,
        exerciseRef: applicationRecord.exercise.referenceNumber,
        oldStage: dataBefore.stage,
        newStage: dataAfter.stage,
      };
      logEvent('info', 'Application Record stage changed', detail, null);
    }

    if (dataBefore.status !== dataAfter.status) {
      const detail = {
        id: applicationRecordId,
        candidateName: applicationRecord.candidate.fullName,
        exerciseRef: applicationRecord.exercise.referenceNumber,
        oldStatus: dataBefore.status,
        newStatus: dataAfter.status,
      };
      logEvent('info', 'Application Record status changed', detail, null);
    }

    return onApplicationRecordUpdate(dataBefore, dataAfter);
  });
