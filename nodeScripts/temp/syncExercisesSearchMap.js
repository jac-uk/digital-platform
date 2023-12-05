'use strict';

/**
 * Node script to update the searchMap (_search) in all exercises
 * The search map is for:
 * exercise name, exercise referenceNumber
 * 
 * Run with: > npm run local:nodeScript temp/syncExercisesSearchMap.js
 */

const { firebase, app, db } = require('../shared/admin.js');
const { getDocuments, applyUpdates } = require('../../functions/shared/helpers.js');
const { getSearchMap } = require('../../functions/shared/search');

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
