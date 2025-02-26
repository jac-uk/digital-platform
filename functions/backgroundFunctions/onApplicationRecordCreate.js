import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { firebase, db, auth } from '../shared/admin.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { logEvent } = initLogEvent(firebase, db, auth);

export default onDocumentCreated('applicationRecords/{applicationRecordId}', (event) => {
  const snap = event.data;
  const applicationRecord = snap.data();
  const detail = {
    applicationRecordId: event.params.applicationRecordId,
    candidateName: applicationRecord.candidate ? applicationRecord.candidate.fullName : null,
    exerciseRef: applicationRecord.exercise.referenceNumber,
  };
  logEvent('info', 'Application Record created', detail);
});
