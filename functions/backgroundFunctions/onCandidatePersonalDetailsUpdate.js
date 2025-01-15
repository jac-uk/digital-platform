import * as functions from 'firebase-functions/v1';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initOnCandidatePersonalDetailsUpdate from '../actions/candidates/personalDetails/onUpdate.js';

const onCandidatePersonalDetailsUpdate = initOnCandidatePersonalDetailsUpdate(config, firebase, db);

export default functions.region('europe-west2').firestore
  .document('candidates/{candidateId}/documents/personalDetails')
  .onUpdate((change, context) => {
    const candidateId = context.params.candidateId;
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onCandidatePersonalDetailsUpdate(candidateId, dataBefore, dataAfter);
  });
