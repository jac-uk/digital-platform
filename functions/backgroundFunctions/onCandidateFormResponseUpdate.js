const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db, auth } = require('../shared/admin');
const onCandidateFormResponseUpdate = require('../actions/candidateFormResponses/onUpdate')(config, firebase, db, auth);

module.exports = functions.region('europe-west2').firestore
  .document('candidateForms/{formId}/responses/{responseId}')
  .onUpdate((change, context) => {
    return onCandidateFormResponseUpdate(
      context.params.responseId, 
      change.before.data(), 
      change.after.data()
    );
  });
