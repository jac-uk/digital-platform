/*
 *  Add progress: {} item to each exercise
 *  
 *  To run:
 *  $ export GOOGLE_CLOUD_PROJECT=digital-platform-staging
 *  $ export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials.json
 *  $ node addProgressObjectToAllExercises.js
 *  
 */

const setData = require('./sharedServices').setData;
const db = require('./sharedServices').db;

console.log('ADDING progress: {} to all existing exercises...');
console.log('');

// Get all exercises
// for each exercise, add progress: {} if it doesn't exist
db.collection('exercises').get()
  .then(snapshot => {
    snapshot.docs.forEach(doc => {
      //console.log(doc.id, '=>', doc.data());
      const progress = doc.data().progress;
      if (progress == null) {
        const data = {
            progress: {},
        };
        setData('exercises', doc.id, data);
      }
    });
    return null;
  })
  .catch(err => {
    console.error('Error getting execises: ', err);
  });

