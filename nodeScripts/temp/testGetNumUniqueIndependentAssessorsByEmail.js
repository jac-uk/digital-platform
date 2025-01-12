'use strict';

/**
 * Get the number of unique independent assessors by email
 */

import { app, db, auth } from '../shared/admin.js';

import { getDocuments, dedupeArrayOfObjects } from '../../functions/shared/helpers.js';

const main = async () => {
  const assessors = [];
  const assessments = await getDocuments(db.collection('assessments').select('assessor.email', 'assessor.fullName'));
  for (let i=0; i<assessments.length; ++i) {
    const assessor = {
      fullName: assessments[i].assessor.fullName,
      email: assessments[i].assessor.email,
    };
    assessors.push(assessor);
  }
  const uniqueAssessors = dedupeArrayOfObjects(assessors, 'email');
  return uniqueAssessors.length;
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
