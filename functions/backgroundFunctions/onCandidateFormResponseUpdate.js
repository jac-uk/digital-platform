import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import initOnCandidateFormResponseUpdate from '../actions/candidateFormResponses/onUpdate.js';

const onCandidateFormResponseUpdate = initOnCandidateFormResponseUpdate(config, firebase, db, auth);

export default functions.region('europe-west2').firestore
  .document('candidateForms/{formId}/responses/{responseId}')
  .onUpdate((change, context) => {
    return onCandidateFormResponseUpdate(
      context.params.responseId, 
      change.before.data(), 
      change.after.data()
    );
  });
