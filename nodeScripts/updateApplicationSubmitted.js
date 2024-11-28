
/**
 * Update the status of submitted applications in second stages.
 * Can specify the exerciseId, stage, status to filter applications,
 * and can specify the updateStatus to the status need to change to.
 * 
 * This script can update the status from 'shortlistingOutcomePassed' to 'fullApplicationSubmitted' 
 * for applications have submitted second stage application in selection days.
 * 
 * const isAction = false;
 * const exerciseId = 'tzGyKNa4SakZ0CS8241V';
 * const stage = 'selection';
 * const status = 'shortlistingOutcomePassed';
 * const updateStatus = 'fullApplicationSubmitted';
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript updateApplicationSubmitted.js
 *   ```
 */
 'use strict';

import { app, db } from './shared/admin.js';
import { applyUpdates, getDocuments, getDocument } from '../functions/shared/helpers.js';

const isAction = false;
const exerciseId = 'tzGyKNa4SakZ0CS8241V';
const stage = 'selection';
const status = 'shortlistingOutcomePassed';
const updateStatus = 'fullApplicationSubmitted';

const main = async () => {
  if (!exerciseId) throw new Error('Please specify an "exerciseId"');

  const exercise = await getDocument(
    db.collection('exercises').doc(exerciseId)
  );

  const applicationContent =  exercise._applicationContent || {};
  console.log('applicationContent[stage]', applicationContent[stage]);
  const targetStageSections = Object.entries(applicationContent[stage] || {})
                                    .filter(([, value]) => value === true)
                                    .map(([key]) => key);

  console.log('targetStageSections', targetStageSections);

  const submittedApplications = [];
  const unfinishedApplications = [];

  // Get all applications for the exercise
  console.log('-- Fetching applications...');
  const applications = await getDocuments(
    db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('_processing.stage', '==', stage)
      .where('_processing.status', '==', status).select('progress')
  );
  console.log(`-- Fetched applications: ${applications.length}`);

  for (const application of applications) {
    let isFinished = true;
    for (const section of targetStageSections) {
      if (!application.progress[section]) {
        isFinished = false;
      }
    }

    if (isFinished) {
      submittedApplications.push(application);
    } else {
      unfinishedApplications.push(application);
    }
  }

  console.log('-- Processing applications...');
  console.log(`-- Submitted applications: ${submittedApplications.length}`);
  console.log(`-- Unfinished applications: ${unfinishedApplications.length}`);

  // console.log('submittedApplications', submittedApplications);
  // console.log('unfinishedApplications', unfinishedApplications);
  const commands = [];

  for (const application of submittedApplications) {
    commands.push({
      command: 'update',
      ref: application.ref,
      data: {
        ['_processing.status']: updateStatus,
      },
    });
    commands.push({
      command: 'update',
      ref: db.collection('applicationRecords').doc(application.id),
      data: {
        status: updateStatus,
      },
    });    
  }

  console.log('-- Commands: ' + commands.length);
  if (commands.length && isAction) {
    const res = await applyUpdates(db, commands);
    console.log(`-- Updated applications: ${res}`);
    return res;
  }

  return '-- No changes made';
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
