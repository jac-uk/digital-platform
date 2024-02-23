/*
 * This script is used to migrate applicationRecord stage and status for a specific exercise.
 */

'use strict';

const { app, db } = require('./shared/admin');
const { EXERCISE_STAGE, APPLICATION_STATUS } = require('./shared/config');
const { applyUpdates, getDocuments } = require('../functions/shared/helpers');

// whether to make changes in firestore
const isAction = false;
const exerciseId = 'Y1gSQnCMhbqpA0nHmDaM';

const main = async () => {
  const previousStats = {
    stage: {},
    status: {},
  };
  const finalStats = {
    stage: {},
    status: {},
  };

  // get all applicationRecords for the exercise
  console.log('-- Fetching applicationRecords...');
  const applicationRecords = await getDocuments(db.collection('applicationRecords').where('exercise.id', '==', exerciseId));
  console.log(`-- Fetched applicationRecords: ${applicationRecords.length}`);
  const commands = [];

  // get payload for each applicationRecord
  console.log('-- Processing applicationRecords...');
  for (let i = 0; i < applicationRecords.length; i++) {
    const applicationRecord = applicationRecords[i];
    const payload = {};

    switch (applicationRecord.stage) {
      case EXERCISE_STAGE.REVIEW:
        payload.stage = EXERCISE_STAGE.APPLIED;
        break;
      case EXERCISE_STAGE.SELECTED:
        payload.stage = EXERCISE_STAGE.SELECTABLE;
        break;
      default:
    }

    switch (applicationRecord.status) {
      case APPLICATION_STATUS.PASSED_FIRST_TEST:
        payload.status = APPLICATION_STATUS.QUALIFYING_TEST_PASSED;
        break;
      case APPLICATION_STATUS.FAILED_FIRST_TEST:
        payload.status = APPLICATION_STATUS.QUALIFYING_TEST_FAILED;
        break;
      case APPLICATION_STATUS.NO_TEST_SUBMITTED:
        payload.status = APPLICATION_STATUS.QUALIFYING_TEST_NOT_SUBMITTED;
        break;
      case APPLICATION_STATUS.TEST_SUBMITTED_OVER_TIME:
        payload.status = APPLICATION_STATUS.QUALIFYING_TEST_FAILED;
        break;
      case APPLICATION_STATUS.PASSED_SCENARIO_TEST:
        payload.status = APPLICATION_STATUS.SCENARIO_TEST_PASSED;
        break;
      case APPLICATION_STATUS.FAILED_SCENARIO_TEST:
        payload.status = APPLICATION_STATUS.SCENARIO_TEST_FAILED;
        break;
      case APPLICATION_STATUS.SUBMITTED_SCENARIO_TEST:
        payload.status = APPLICATION_STATUS.SCENARIO_TEST_FAILED;
        break;
      case APPLICATION_STATUS.PASSED_SIFT:
        payload.status = APPLICATION_STATUS.SIFT_PASSED;
        break;
      case APPLICATION_STATUS.FAILED_SIFT:
        payload.status = APPLICATION_STATUS.SIFT_FAILED;
        break;
      case APPLICATION_STATUS.PASSED_TELEPHONE_ASSESSMENT:
        payload.status = APPLICATION_STATUS.TELEPHONE_ASSESSMENT_PASSED;
        break;
      case APPLICATION_STATUS.FAILED_TELEPHONE_ASSESSMENT:
        payload.status = APPLICATION_STATUS.TELEPHONE_ASSESSMENT_FAILED;
        break;
      case APPLICATION_STATUS.INVITED_TO_SELECTION_DAY:
        payload.status = APPLICATION_STATUS.SHORTLISTING_PASSED;
        break;
      case APPLICATION_STATUS.REJECTED_AS_INELIGIBLE:
        payload.status = APPLICATION_STATUS.REJECTED_INELIGIBLE_ADDITIONAL;
        break;
      case APPLICATION_STATUS.PASSED_SELECTION:
        payload.status = APPLICATION_STATUS.SELECTION_DAY_PASSED;
        break;
      case APPLICATION_STATUS.FAILED_SELECTION:
        payload.status = APPLICATION_STATUS.SELECTION_DAY_FAILED;
        break;
      case APPLICATION_STATUS.REJECTED_BY_CHARACTER:
        payload.status = APPLICATION_STATUS.REJECTED_CHARACTER;
        break;
      case APPLICATION_STATUS.PASSED_BUT_NOT_RECOMMENDED:
        payload.status = APPLICATION_STATUS.PASSED_RECOMMENDED;
        break;
      case APPLICATION_STATUS.APPROVED_FOR_IMMEDIATE_APPOINTMENT:
        payload.status = APPLICATION_STATUS.APPROVED_IMMEDIATE;
        break;
      case APPLICATION_STATUS.APPROVED_FOR_FUTURE_APPOINTMENT:
        payload.status = APPLICATION_STATUS.APPROVED_FUTURE;
        break;
      case APPLICATION_STATUS.SCC_TO_RECONSIDER:
        payload.status = APPLICATION_STATUS.RECONSIDER;
        break;
      case APPLICATION_STATUS.WITHDREW_APPLICATION:
        payload.status = APPLICATION_STATUS.WITHDRAWN;
        break;
      case APPLICATION_STATUS.SUBMITTED_FIRST_TEST:
        break;
      default:
    }

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
