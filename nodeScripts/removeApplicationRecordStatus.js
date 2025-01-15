/*
 * This script is used to remove specified status in the applicationRecords for a specific exercise.
 */

'use strict';

import { firebase, app, db } from './shared/admin.js';
import { applyUpdates, getDocuments } from '../functions/shared/helpers.js';

// whether to make changes in firestore
const isAction = false;
const exerciseId = '';
const status = '';

const main = async () => {
  if (!exerciseId || !status) {
    throw new Error('Please specify exerciseId and status');
  }

  // get applicationRecords with specified status for the exercise
  console.log('-- Fetching applicationRecords...');
  const ref = db.collection('applicationRecords').where('exercise.id', '==', exerciseId).select('status', 'statusLog');
  const applicationRecords = await getDocuments(ref);
  console.log(`-- Fetched applicationRecords: ${applicationRecords.length}`);
  const commands = [];

  // get payload for each applicationRecord
  console.log('-- Processing applicationRecords...');
  for (let i = 0; i < applicationRecords.length; i++) {
    const applicationRecord = applicationRecords[i];
    const payload = {};
    if (applicationRecord.status === status) {
      payload.status = '';
    }
    if (applicationRecord.statusLog && applicationRecord.statusLog[status]) {
      payload[`statusLog.${status}`] = firebase.firestore.FieldValue.delete();
    }
    console.log(payload);

    if (Object.keys(payload).length) {
      commands.push({
        command: 'update',
        ref: applicationRecord.ref,
        data: payload,
      });
    }
  }
  console.log(`-- Number of applicationRecords to update: ${commands.length}`);

  if (isAction && commands.length) {
    const res = await applyUpdates(db, commands);
    console.log(`-- Updated applicationRecords: ${res}`);
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
