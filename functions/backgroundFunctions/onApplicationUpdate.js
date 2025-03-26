import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { firebase, db, auth } from '../shared/admin.js';
import initApplicationOnUpdate from '../actions/applications/onUpdate.js';
import initLogEvent from '../actions/logs/logEvent.js';

const onApplicationUpdate = initApplicationOnUpdate(firebase, db, auth);
const { logEvent } = initLogEvent(firebase, db, auth);

export default onDocumentUpdated(
  {
    document: 'applications/{applicationId}',
    memory: '512MiB', // Specify memory allocation
  },
  (event) => {
  const dataBefore = event.data.before.data();
  const dataAfter = event.data.after.data();
  const applicationId = event.params.applicationId;

  if (dataBefore.status !== dataAfter.status) {
    const detail = {
      applicationId: applicationId,
      candidateName: dataAfter.personalDetails.fullName,
      exerciseRef: dataAfter.exerciseRef,
      oldStatus: dataBefore.status,
      newStatus: dataAfter.status,
    };
    logEvent('info', 'Application status changed', detail);
  }

  return onApplicationUpdate(applicationId, dataBefore, dataAfter);
});
