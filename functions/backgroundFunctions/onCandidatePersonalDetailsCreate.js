const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin');
const onCandidatePersonalDetailsCreate = require('../actions/candidates/personalDetails/onCreate')(config, firebase, db);

module.exports = functions.region('europe-west2').firestore
  .document('candidates/{candidateId}/documents/personalDetails')
  .onCreate((document, context) => {
    const candidateId = context.params.candidateId;
    const data = document.data();
    return onCandidatePersonalDetailsCreate(candidateId, data);
  });
