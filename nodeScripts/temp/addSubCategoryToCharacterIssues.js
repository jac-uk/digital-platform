
/**
 * Migrate all live exercises to `_processingVersion` 2. This updates all `applicationRecords` for each exercise
 */
'use strict';

import { firebase, app, db } from '../shared/admin.js';
import { getDocuments, applyUpdates } from '../../functions/shared/helpers.js';
import flagApplicationIssues from '../../functions/actions/applications/flagApplicationIssues.js';
import _last from 'lodash/last.js';


const { getCharacterIssues } = flagApplicationIssues(firebase, db);

async function addSubCategoryToCharacterIssuesForExercise(exercise) {
      // batched process applications
      const batchSize = 100;
      let applications = [];
      let lastApplicationDoc = null;
      let lastApplication = null;

      do {
        // get submitted applications
        let query = db
          .collection('applications')
          .where('exerciseId', '==', exercise.id)
          .where('status', '==', 'applied')
          .orderBy('createdAt');
  
        if (lastApplicationDoc) {
          query = query.startAfter(lastApplicationDoc);
        }
  
        query = query.limit(batchSize);
  
        const applicationSnapshot = await query.get();
        applications = [];
        applicationSnapshot.forEach((doc) => {
          const document = doc.data();
          document.id = doc.id;
          document.ref = doc.ref;
          applications.push(document);
        });
  
        // end the loop if no more applications
        if (!applications.length) {
          break;
        }
  
        // update cursor & total
        lastApplicationDoc = _last(applicationSnapshot.docs);
        lastApplication = _last(applications);
  
        // process application
        const result = await updateApplicationIssues(exercise, applications);
        if (!result) {
          console.log(`Fail to update Application Issues, start after application: ${lastApplication.id}`);
          return false;
        }
  
        console.log(`Issues of ${applications.length} applications processed, start after application: ${lastApplication.id}`);
      } while (applications.length);
  
}

async function updateApplicationIssues(exercise, applications) {
  // get application records
  const applicationRecords = await getDocuments(db.collection('applicationRecords').where('exercise.id', '==', exercise.id));
  const applicationRecordMap = {};
  applicationRecords.forEach((record) => {
    applicationRecordMap[record.id] = record;
  });

  // construct commands
  const commands = [];

  applicationLoop: for (let i = 0, len = applications.length; i < len; ++i) {    
    const applicationRecord = applicationRecordMap[applications[i].id];
    if (!applicationRecord) {
      // not to update character issues of the applications
      continue;
    }
    // get character issues
    const existingCharacterIssues = applicationRecord?.issues?.characterIssues || [];
    const characterIssues = getCharacterIssues(exercise, applications[i]);
    
    if (!applicationRecord?.flags?.characterIssues) {
      // not to update character issues of the applications
      continue;
    }
    
    if (!existingCharacterIssues.length || !characterIssues.length) {
      // not to update character issues of the applications
      continue;
    }

    if (existingCharacterIssues.length !== characterIssues.length) {
      // not to update character issues of the applications
      continue;
    }

    // add sub-category to character issues
    const characterIssueData = [];
    for (let j = 0, len2 = existingCharacterIssues.length; j < len2; ++j) {
      const existingCharacterIssue = existingCharacterIssues[j];
      const characterIssue = characterIssues[j];

      // try to match events
      const existingEvents = existingCharacterIssue.events || [];
      const events = characterIssue.events || [];

      // if the events do not match, skip this application record
      if (existingEvents.length !== events.length) {
        // jump to the next application record
        continue applicationLoop;
      }

      const eventData = [];
      for (let k = 0, len3 = existingEvents.length; k < len3; ++k) {
        const existingEvent = existingEvents[k];
        const event = events[k];

        eventData.push({
          ...existingEvent,
          category: event.category,
        });
        
      }
      characterIssueData.push({
        ...existingCharacterIssue,
        events: eventData,
      });
    }

    if (characterIssueData.length) {
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(`${applications[i].id}`),
        data: {'issues.characterIssues': characterIssueData},
      });
    }
  }

  // write to db
  const result = await applyUpdates(db, commands);

  // return
  return result ? commands.length : false;
}
  


const main = async () => {
  
  // get all relevant exercises
  const exercises = await getDocuments(db.collection('exercises').where('state', 'not-in', ['archived', 'deleted']));

  console.log('exercises', exercises.length);

  // for each exercise run the migration and update the exercise document with new version number
  for (let i = 0, len = exercises.length; i < len; ++i) {
    // if (exercises[i].id !== 'X40tLeB3DuKBUsq72AU7') {
    //   console.log('Skipping exercise', exercises[i].id);
    //   continue;
    // };
    try {
      console.log('Update exercise', exercises[i].id);
      await addSubCategoryToCharacterIssuesForExercise(exercises[i]);  
    } catch (e) {
      console.log('error', e);
    }  
  }

};

main()
  .then(() => {
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
