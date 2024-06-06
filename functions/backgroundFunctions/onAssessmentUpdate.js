const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { onAssessmentCompleted } = require('../actions/assessments')(config, firebase, db);
const { getSearchMap } = require('../shared/search');

const has = require('lodash/has');
const { isDifferentPropsByPath } = require('../shared/helpers.js');

module.exports = functions.region('europe-west2').firestore
  .document('assessments/{assessmentId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    // const applicationId = context.params.applicationId;

    const updateSearchMap = isDifferentPropsByPath(before, after, 'application.referenceNumber') ||
      isDifferentPropsByPath(before, after, 'assessor.email') ||
      isDifferentPropsByPath(before, after, 'assessor.fullName') ||
      isDifferentPropsByPath(before, after, 'candidate.fullName');

    if (updateSearchMap) {
      const updateArray = [];
      if (has(after, 'assessor.fullName')) {
        updateArray.push(after.assessor.fullName);
      }
      if (has(after, 'assessor.email')) {
        updateArray.push(after.assessor.email);
      }
      if (has(after, 'application.referenceNumber')) {
        updateArray.push(after.application.referenceNumber);
      }
      if (has(after, 'candidate.fullName')) {
        updateArray.push(after.candidate.fullName);
      }

      // add search map
      await db.doc(`assessments/${context.params.assessmentId}`).update({
        _search: getSearchMap(updateArray),
      });
    }

    if (after.status !== before.status && after.status === 'completed') {
      onAssessmentCompleted(context.params.assessmentId, after);
    }

    return true;
  });
