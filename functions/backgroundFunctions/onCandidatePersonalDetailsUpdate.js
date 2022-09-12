const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin');
const onCandidatePersonalDetailsUpdate = require('../actions/candidates/personalDetails/onUpdate')(config, firebase, db);
const { sentry } = require('../shared/sentry')(config);

module.exports = functions.region('europe-west2').firestore
  .document('candidates/{candidateId}/documents/personalDetails')
  .onUpdate(sentry.GCPFunction.wrapEventFunction((change, context) => {
    const candidateId = context.params.candidateId;
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onCandidatePersonalDetailsUpdate(candidateId, dataBefore, dataAfter);
  }));
