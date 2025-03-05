import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { firebase, db } from '../shared/admin.js';
import initOnCandidatePersonalDetailsCreate from '../actions/candidates/personalDetails/onCreate.js';

const onCandidatePersonalDetailsCreate = initOnCandidatePersonalDetailsCreate(firebase, db);

export default onDocumentCreated('candidates/{candidateId}/documents/personalDetails', (event) => {
  const candidateId = event.params.candidateId;
  const data = event.data.data();
  return onCandidatePersonalDetailsCreate(candidateId, data);
});
