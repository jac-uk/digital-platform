const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { onAssessmentCompleted } = require('../actions/assessments')(config, firebase, db);
const { getSearchMap } = require('../shared/search');

module.exports = functions.region('europe-west2').firestore
  .document('assessments/{assessmentId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();

    const updateSearchMap = (before.application.referenceNumber !== after.application.referenceNumber) || 
      (before.assessor.email !== after.assessor.email) ||
      (before.assessor.fullName !== after.assessor.fullName) || 
      (before.candidate.fullName !== after.candidate.fullName);

    if (updateSearchMap) {
      // add search map
      await db.doc(`assessments/${dataBefore.id}`).update({
        _search: getSearchMap([
          after.assessor.fullName,
          after.assessor.email,
          after.application.referenceNumber,
          after.candidate.fullName,
        ]),
      });
    }

    if (after.status !== before.status && after.status === 'completed') {
      onAssessmentCompleted(context.params.assessmentId, after);
    }
    return true;
  });
