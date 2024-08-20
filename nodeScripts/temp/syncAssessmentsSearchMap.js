'use strict';

/**
 * Node script to update the searchMap (_search) in all assessments
 * The search map is for:
 * assessor full name, assessor email, application referenceNumber, candidate full name
 * 
 * Run with: > npm run local:nodeScript temp/syncAssessmentsSearchMap.js
 */

import { firebase, app, db } from '../shared/admin.js';
import { getDocuments, applyUpdates } from '../../functions/shared/helpers.js';
import { getSearchMap } from '../../functions/shared/search.js';
import { objectHasNestedProperty } from '../../functions/shared/helpers.js';

async function updateAllAssessments() {
  const commands = [];
  const assessments = await getDocuments(db.collection('assessments').select('assessor', 'candidate', 'application'));
  for (let i = 0, len = assessments.length; i < len; ++i) {
    const assessment = assessments[i];

    const searchable = [];

    // Check if data exists
    const hasAssessorEmail = objectHasNestedProperty(assessment, 'assessor.email');
    const hasAssessorFullName = objectHasNestedProperty(assessment, 'assessor.fullName');
    const hasAssessorCandidateFullName = objectHasNestedProperty(assessment, 'candidate.fullName');
    const hasApplicationReferenceNumber = objectHasNestedProperty(assessment, 'application.referenceNumber');

    if (hasAssessorEmail) {
      searchable.push(assessment.assessor.email);
    }
    if (hasAssessorFullName) {
      searchable.push(assessment.assessor.fullName);
    }
    if (hasAssessorCandidateFullName) {
      searchable.push(assessment.candidate.fullName);
    }
    if (hasApplicationReferenceNumber) {
      searchable.push(assessment.application.referenceNumber);
    }

    commands.push({
      command: 'update',
      ref: assessment.ref,
      data: {
        _search: getSearchMap(searchable),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      },
    });
  }

  // write to db
  const result = await applyUpdates(db, commands);
  return result ? assessments.length : false;
}

const main = async () => {
  return updateAllAssessments();
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
