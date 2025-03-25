import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { firebase, db, auth } from '../shared/admin.js';
import initApplications from '../actions/applications/applications.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { onApplicationCreate } = initApplications(firebase, db, auth);
const { logEvent } = initLogEvent(firebase, db, auth);

export default onDocumentCreated(
  {
    document: 'applications/{applicationId}',
    memory: '512MiB', // Specify memory allocation
  },
  (event) => {
    const snap = event.data;
    const application = snap.data();
    const details = {
      applicationId: event.params.applicationId,
      candidateName: application.personalDetails ? application.personalDetails.fullName : null,
      exerciseRef: application.exerciseRef,
    };
    logEvent('info', 'Application created', details);
    return onApplicationCreate(snap.ref, snap.data());
  }
);
