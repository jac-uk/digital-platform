const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { onAssessmentCompleted } = require('../actions/assessments')(config, firebase, db);

module.exports = functions.region('europe-west2').firestore
  .document('assessments/{assessmentId}')
  .onUpdate((change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    if (after.status !== before.status && after.status === 'completed') {
      onAssessmentCompleted(context.params.assessmentId, after);
    }
    return true;
  });
