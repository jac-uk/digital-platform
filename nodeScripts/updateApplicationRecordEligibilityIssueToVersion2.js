/*
 * This script updates eligibility report data of legal exercise to version 2.
 */

'use strict';

import { app, db } from './shared/admin.js';
import { applyUpdates, getDocuments } from '../functions/shared/helpers.js';

// whether to make changes in `exercises` collection in firestore
const isAction = false;
const createdAtBefore = new Date('2024-05-09');

const main = async () => {
  // get all legal exercise
  const exerciseRef = db.collection('exercises')
                .where('typeOfExercise', 'in', ['legal', 'leadership'])
                .where('createdAt', '<=', createdAtBefore);
  const legalExercises = await getDocuments(exerciseRef);
  const isLegalExercise = legalExercises.reduce((acc, exercise) => { 
    acc[exercise.id] = true;
    return acc;
  }, {});

  console.log('isLegalExercise', JSON.stringify(isLegalExercise));

  // get exercises that have not been launched
  console.log('Fetching applicationRecords having eligibilityIssuesStatus ...');
  const applicationRecordRef = db.collection('applicationRecords')
                .where('issues.eligibilityIssuesStatus', '!=', '');
                //.where('createdAt', '<=', createdAtBefore);
  const applicationRecords = await getDocuments(applicationRecordRef);
  console.log('Fetched applicationRecords:', applicationRecords.length);

  const ids = [];
  const allData = [];
  const commands = [];
  for (let i = 0; i < applicationRecords.length; i++) {
    const applicationRecord = applicationRecords[i];
    
    // only update records of legal exercise
    const exerciseId = applicationRecord.exercise.id;
    if (!isLegalExercise[exerciseId]) {
      continue;
    }


    const recommendation = applicationRecord.issues.eligibilityIssuesStatus;
    const reasons = applicationRecord.issues.eligibilityIssuesStatusReason || '';
    const v2EligibilityIssues = applicationRecord.issues.eligibilityIssues.map((issue) => {
      return { 
        ...issue ,
        result: recommendation,
        comments: reasons,
      };
      
    });
    const data = {
      'issues.eligibilityIssues': v2EligibilityIssues,
    };
    allData.push(data);
    ids.push(applicationRecord.id);

    commands.push({
      command: 'update',
      ref: db.collection('applicationRecords').doc(applicationRecord.id),
      data,
    });
  }

  console.log('ids', JSON.stringify(ids));
  console.log('allData', JSON.stringify(allData));

  if (commands.length && isAction) {
    // write to db
    console.log(commands.length);
    const res = await applyUpdates(db, commands);
    return res;
  }

  return 'No changes made in exercises collection.';
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
