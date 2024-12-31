/*
 * This script is used to migrate applicationRecord stage and status for a specific exercise.
 */

'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import { applyUpdates, getDocuments, getDocument } from '../functions/shared/helpers.js';
import initUpdateApplicationRecordStageStatus from '../functions/actions/applicationRecords/updateApplicationRecordStageStatus.js';

const { getApplicationRecordStageStatus, getExerciseApplicationRecords } = initUpdateApplicationRecordStageStatus(firebase, config, db);

// whether to make changes in firestore
const isAction = false;
const exerciseId = '1qef6rsaSLvvsZHrJuw7';
const version = 2;

const main = async () => {
  const previousStats = {
    stage: {},
    status: {},
  };
  const finalStats = {
    stage: {},
    status: {},
  };

  // get exercise
  const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
  // get all applicationRecords for the exercise
  console.log('-- Fetching applicationRecords...');
  const applicationRecords = await getDocuments(db.collection('applicationRecords').where('exercise.id', '==', exerciseId));
  console.log(`-- Fetched applicationRecords: ${applicationRecords.length}`);
  const commands = [];

  // get payload for each applicationRecord
  console.log('-- Processing applicationRecords...');
  for (let i = 0; i < applicationRecords.length; i++) {
    const applicationRecord = applicationRecords[i];
    const payload = getApplicationRecordStageStatus(applicationRecord, version);

    if (Object.keys(payload).length) {
      commands.push({
        command: 'update',
        ref: applicationRecord.ref,
        data: payload,
      });
    }

    const finalStage = payload.stage || applicationRecord.stage;
    const finalStatus = payload.status || applicationRecord.status;
    calculateStats(applicationRecord.stage, applicationRecord.status, previousStats);
    calculateStats(finalStage, finalStatus, finalStats);
  }
  console.log(`-- Processed applicationRecords: ${commands.length}`);
  console.log(`-- Previous stats: ${JSON.stringify(previousStats, null, 2)}`);
  console.log(`-- Final stats: ${JSON.stringify(finalStats, null, 2)}`);
  console.log(`-- Number of applicationRecords to update: ${commands.length}`);

  // update count of applicationRecords in exercise
  const exercisePayload = getExerciseApplicationRecords(exercise, version);
  if (Object.keys(exercisePayload).length) {
    commands.push({
      command: 'update',
      ref: exercise.ref,
      data: exercisePayload,
    });
  }

  if (isAction && commands.length) {
    const res = await applyUpdates(db, commands);
    console.log(`-- Updated applicationRecords: ${res}`);
    return res;
  }

  return '-- No changes made';
};

function calculateStats(stage, status, stats) {
  if (stats.stage[stage]) {
    stats.stage[stage]++;
  } else {
    stats.stage[stage] = 1;
  }
  if (stats.status[status]) {
    stats.status[status]++;
  } else {
    stats.status[status] = 1;
  }
}

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
