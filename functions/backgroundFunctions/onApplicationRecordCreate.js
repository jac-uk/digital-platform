import * as functions from 'firebase-functions/v1';
import { firebase, db, auth } from '../shared/admin.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { logEvent } = initLogEvent(firebase, db, auth);

export default functions.region('europe-west2').firestore
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
