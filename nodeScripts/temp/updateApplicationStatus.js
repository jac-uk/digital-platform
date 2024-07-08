
/**
 * For all applications in a specific exercise with status = 'shortlistingOutcomePassed' do the following:
 * 1) Remove 'shortlistingOutcomePassed' item from the statusLogs
 * 2) For all records with 'withdrawn' in the statusLogs, set the status to 'withdrawn' otherwise set the status to empty
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript temp/updateApplicationStatus.js
 *   ```
 */
 'use strict';

const config = require('../shared/config.js');
const { APPLICATION_STATUS } = config;
const { app, db } = require('../shared/admin.js');
const {applyUpdates, getDocuments} = require('../../functions/shared/helpers.js');

// const config = require('./shared/config');
// const { firebase, app, db } = require('./shared/admin');
// const { applyUpdates, getDocuments, getDocument } = require('../functions/shared/helpers');
// const { getApplicationRecordStageStatus, getExerciseApplicationRecords } = require('../functions/actions/applicationRecords/updateApplicationRecordStageStatus')(firebase, config, db);

// LIVE EXERCISE
//const exerciseId = 'IiaXjmpDQd7BQx7ovlv0';

// DEV EXERCISE
const exerciseId = 'wdpALbyICL7ZxxN5AQt8';

// applicationRecrdsIds we're using for testing:
// 0rOoh2nWZkghTluPr5Nx
// KMjcryiCE3Fr9eYpKbcz
// KtPwJAreAOaBZWP1Pcp9

const main = async () => {

  // Get all applicationRecords for the exercise where status = 'shortlistingOutcomePassed'
  console.log('-- Fetching applicationRecords...');
  const applicationRecords = await getDocuments(db.collection('applicationRecords').where('exercise.id', '==', exerciseId).where('status', '==', 'shortlistingOutcomePassed'));
  console.log(`-- Fetched applicationRecords: ${applicationRecords.length}`);
  const commands = [];

  console.log('-- Processing applicationRecords...');
  
  for (let i = 0; i < applicationRecords.length; i++) {

    // Set the status to empty
    let payload = {
      status: '',
    };
    const applicationRecord = applicationRecords[i];

    console.log(`applicationRecord id: ${applicationRecord.id}`);
    console.log(`-- applicationRecord status: ${applicationRecord.status}`);
    if ('statusLog' in applicationRecord) {
      console.log('-- applicationRecord statusLog:');
      console.log(applicationRecord.statusLog);

      // Set the status to 'withdrawn' if it's in the statusLog
      if (APPLICATION_STATUS.WITHDRAWN in applicationRecord.statusLog) {
        payload.status = APPLICATION_STATUS.WITHDRAWN;
      }
      
      // Remove 'shortlistingOutcomePassed' from the statusLog
      if ('shortlistingOutcomePassed' in applicationRecord.statusLog) {
        delete applicationRecord.statusLog.shortlistingOutcomePassed;
        payload.statusLog = applicationRecord.statusLog;

        console.log('-- NEW applicationRecord.statusLog:');
        console.log(applicationRecord.statusLog);
      }
    }
    else {
      console.log('-- no statusLog');
    }

    if (Object.keys(payload).length) {

      console.log('-- NEW payload:');
      console.log(payload);

      commands.push({
        command: 'update',
        ref: applicationRecord.ref,
        data: payload,
      });
    }
  }

  if (commands.length) {
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
