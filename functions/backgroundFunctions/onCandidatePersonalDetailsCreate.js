import * as functions from 'firebase-functions/v1';
import { firebase, db } from '../shared/admin.js';
import initOnCandidatePersonalDetailsCreate from '../actions/candidates/personalDetails/onCreate.js';

const onCandidatePersonalDetailsCreate = initOnCandidatePersonalDetailsCreate(firebase, db);

export default functions.region('europe-west2').firestore
  .document('candidates/{candidateId}/documents/personalDetails')
  .onCreate((document, context) => {
    const candidateId = context.params.candidateId;
    const data = document.data();
    return onCandidatePersonalDetailsCreate(candidateId, data);
  });
