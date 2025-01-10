import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import initApplicationRecords from '../actions/applicationRecords.js';
import initLogEvent from '../actions/logs/logEvent.js';

const { onApplicationRecordUpdate } = initApplicationRecords(config, firebase, db, auth);
const { logEvent } = initLogEvent(firebase, db, auth);

export default functions.region('europe-west2').firestore
  .document('applicationRecords/{applicationRecordId}')
  .onUpdate(async (change, context) => {

    const dataBefore = change.before.data();
    const dataAfter = change.after.data();

    if (dataBefore.stage !== dataAfter.stage) {
      const detail = {
        applicationRecordId: change.after.id,
        candidateName: dataAfter.candidate.fullName,
        exerciseRef: dataAfter.exercise.referenceNumber,
        oldStage: dataBefore.stage,
        newStage: dataAfter.stage,
      };
      logEvent('info', 'Application Record stage changed', detail);
    }

    if (dataBefore.status !== dataAfter.status) {
      const detail = {
        applicationRecordId: change.after.id,
        candidateName: dataAfter.candidate.fullName,
        exerciseRef: dataAfter.exercise.referenceNumber,
        oldStatus: dataBefore.status,
        newStatus: dataAfter.status,
      };
      logEvent('info', 'Application Record status changed', detail);
    }

    return onApplicationRecordUpdate(dataBefore, dataAfter);
  });
