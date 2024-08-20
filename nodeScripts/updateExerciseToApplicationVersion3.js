/*
 * This script updates exercises that have not been launched and are in application version 2 to application version 3.
 */

'use strict';

import { firebase, app, db } from './shared/admin.js';
import { applyUpdates, getDocuments } from '../functions/shared/helpers.js';

// whether to make changes in `exercises` collection in firestore
const isAction = false;

const main = async () => {
  // get exercises that have not been launched
  console.log('Fetching exercises...');
  const ref = db.collection('exercises')
    .where('state', 'in', ['draft', 'ready'])
    .where('published', '==', false)
    .where('_applicationVersion', '==', 2)
    .where('applicationOpenDate', '>=', new Date('2024-02-19'));
  const exercises = await getDocuments(ref);
  console.log('Fetched exercises:', exercises.length);

  const commands = [];
  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    const data = {
      _applicationVersion: 3,
    };
    if (['legal', 'leadership'].includes(exercise.typeOfExercise)) {
      // for legal exercise remove `judicialExperience` and `employmentGaps` from `progress` field as they are included in `postQualificationWorkExperience`
      data['progress.judicialExperience'] = firebase.firestore.FieldValue.delete();
      data['progress.employmentGaps'] = firebase.firestore.FieldValue.delete();
    }
    commands.push({
      command: 'update',
      ref: db.collection('exercises').doc(exercise.id),
      data,
    });
  }

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
