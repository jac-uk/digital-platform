const { getDocument, getDocuments, applyUpdates, getDocumentsFromQueries } = require('../../shared/helpers');

module.exports = (config, db) => {
  const { EXERCISE_STAGE, APPLICATION_STATUS } = config;

  return {
    updateApplicationRecordStageStatus,
    getStageStatus,
  };

  /**
   * updateApplicationRecordStageStatus
   * 
   * Updates specified applications records with the new stage and status
   * @param {*} `params` is an object containing
   *   `exerciseId` (required) ID of exercise
   *   `version`    (required) _processingVersion of the exercise
   */
  async function updateApplicationRecordStageStatus(params) {
    const { exerciseId, version } = params;

    // get application records from reference numbers
    const applicationRecords = await getDocuments(db.collection('applicationRecords').where('exercise.id', '==', exerciseId));

    // construct db commands
    const commands = [];
    for (let i = 0, len = applicationRecords.length; i < len; ++i) {
      const applicationRecord = applicationRecords[i];
      const payload = getStageStatus(applicationRecord, version);

      if (Object.keys(payload).length) {
        commands.push({
          command: 'update',
          ref: applicationRecord.ref,
          data: payload,
        });
      }
    }

    // write to db
    const result = await applyUpdates(db, commands);

    // return
    return result ? commands.length : false;
  }

  function getStageStatus(applicationRecord, version) {
    const payload = {};

    if (version === 1 && applicationRecord._backups && applicationRecord._backups.processingVersion1) {
      const { stage, status } = applicationRecord._backups.processingVersion1;
      if (applicationRecord.stage !== stage) payload.stage = stage;
      if (applicationRecord.status !== status) payload.status = status;
    } else if (version === 2) {
      // back up stage and status
      payload['_backups.processingVersion1.stage'] = applicationRecord.stage;
      payload['_backups.processingVersion1.status'] = applicationRecord.status;

      // update stage
      switch (applicationRecord.stage) {
        case EXERCISE_STAGE.REVIEW:
          payload.stage = EXERCISE_STAGE.APPLIED;
          break;
        case EXERCISE_STAGE.SELECTED:
          payload.stage = EXERCISE_STAGE.SELECTABLE;
          break;
        default:
      }
      // update status
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
    }

    return payload;
  }
};
