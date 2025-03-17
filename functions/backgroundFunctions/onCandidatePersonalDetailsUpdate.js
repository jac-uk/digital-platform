import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { firebase, db } from '../shared/admin.js';
import initOnCandidatePersonalDetailsUpdate from '../actions/candidates/personalDetails/onUpdate.js';

const onCandidatePersonalDetailsUpdate = initOnCandidatePersonalDetailsUpdate(firebase, db);

export default onDocumentUpdated('candidates/{candidateId}/documents/personalDetails', (event) => {
  const candidateId = event.params.candidateId;
  const dataBefore = event.data.before.data();
  const dataAfter = event.data.after.data();
  return onCandidatePersonalDetailsUpdate(candidateId, dataBefore, dataAfter);
});
