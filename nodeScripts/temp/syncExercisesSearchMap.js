'use strict';

/**
 * Node script to update the searchMap (_search) in all exercises
 * The search map is for:
 * exercise name, exercise referenceNumber
 * 
 * Run with: > npm run local:nodeScript temp/syncExercisesSearchMap.js
 */

import { firebase, app, db } from '../shared/admin.js';
import { getDocuments, applyUpdates } from '../../functions/shared/helpers.js';
import { getSearchMap } from '../../functions/shared/search.js';

async function updateAllExercises() {
  const commands = [];
  const exercises = await getDocuments(
    db.collection('exercises')
    .select('name', 'referenceNumber')
  );
  for (let i = 0, len = exercises.length; i < len; ++i) {
    const exercise = exercises[i];
    commands.push({
      command: 'update',
      ref: exercise.ref,
      data: {
        _search: getSearchMap([exercise.name, exercise.referenceNumber]),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      },
    });  
  }

  // write to db
  const result = await applyUpdates(db, commands);
  return result ? commands.length : false;
}

const main = async () => {
  return updateAllExercises();
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
