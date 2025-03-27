import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { firebase, db, auth } from '../shared/admin.js';
import initApplicationRecords from '../actions/applicationRecords.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { onApplicationRecordUpdate } = initApplicationRecords(firebase, db, auth);
const { logEvent } = initLogEvent(firebase, db, auth);

export default onDocumentUpdated('applicationRecords/{applicationRecordId}', (event) => {

  const dataBefore = event.data.before.data();
  const dataAfter = event.data.after.data();

  if (dataBefore.stage !== dataAfter.stage) {
    const detail = {
      applicationRecordId: event.data.after.id,
      candidateName: dataAfter.candidate.fullName,
      exerciseRef: dataAfter.exercise.referenceNumber,
      oldStage: dataBefore.stage,
      newStage: dataAfter.stage,
    };
    logEvent('info', 'Application Record stage changed', detail);
  }

  if (dataBefore.status !== dataAfter.status) {
    const detail = {
      applicationRecordId: event.data.after.id,
      candidateName: dataAfter.candidate.fullName,
      exerciseRef: dataAfter.exercise.referenceNumber,
      oldStatus: dataBefore.status,
      newStatus: dataAfter.status,
    };
    logEvent('info', 'Application Record status changed', detail);
  }

  return onApplicationRecordUpdate(dataBefore, dataAfter);
});
