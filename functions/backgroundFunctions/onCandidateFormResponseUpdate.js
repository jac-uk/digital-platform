import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { firebase, db, auth } from '../shared/admin.js';
import initOnCandidateFormResponseUpdate from '../actions/candidateFormResponses/onUpdate.js';

const onCandidateFormResponseUpdate = initOnCandidateFormResponseUpdate(firebase, db, auth);

export default onDocumentUpdated('candidateForms/{formId}/responses/{responseId}', (event) => {
  return onCandidateFormResponseUpdate(
    event.params.responseId,
    event.data.before.data(),
    event.data.after.data()
  );
});
