const { getDocument, getDocuments, applyUpdates, getDocumentsFromQueries } = require('../../shared/helpers');

module.exports = (firebase, config, db) => {
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
    const applicationRecords = await getDocuments(db.collection('applicationRecords').where('exercise.id', '==', exerciseId).select('_backup', 'stage', 'status'));

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

  function convertStageToVersion2(stage) {
    switch (stage) {
      case EXERCISE_STAGE.APPLIED:
      case EXERCISE_STAGE.REVIEW:
        return EXERCISE_STAGE.SHORTLISTING;
      case EXERCISE_STAGE.SHORTLISTED:
        return EXERCISE_STAGE.SELECTION;
      case EXERCISE_STAGE.SELECTABLE:
        return EXERCISE_STAGE.SCC;
      case EXERCISE_STAGE.SELECTED:
      case EXERCISE_STAGE.RECOMMENDED:
      case EXERCISE_STAGE.HANDOVER:
        return EXERCISE_STAGE.RECOMMENDATION;
      default:
        return '';
    }
  }

  function convertStatusToVersion2(status) {
    switch (status) {
      case APPLICATION_STATUS.PASSED_FIRST_TEST:
        return APPLICATION_STATUS.QUALIFYING_TEST_PASSED;
      case APPLICATION_STATUS.FAILED_FIRST_TEST:
        return APPLICATION_STATUS.QUALIFYING_TEST_FAILED;
      case APPLICATION_STATUS.NO_TEST_SUBMITTED:
        return APPLICATION_STATUS.QUALIFYING_TEST_NOT_SUBMITTED;
      case APPLICATION_STATUS.TEST_SUBMITTED_OVER_TIME:
        return APPLICATION_STATUS.QUALIFYING_TEST_FAILED;
      case APPLICATION_STATUS.PASSED_SCENARIO_TEST:
        return APPLICATION_STATUS.SCENARIO_TEST_PASSED;
      case APPLICATION_STATUS.FAILED_SCENARIO_TEST:
        return APPLICATION_STATUS.SCENARIO_TEST_FAILED;
      case APPLICATION_STATUS.SUBMITTED_SCENARIO_TEST:
        return APPLICATION_STATUS.SCENARIO_TEST_FAILED;
      case APPLICATION_STATUS.PASSED_SIFT:
        return APPLICATION_STATUS.SIFT_PASSED;
      case APPLICATION_STATUS.FAILED_SIFT:
        return APPLICATION_STATUS.SIFT_FAILED;
      case APPLICATION_STATUS.PASSED_TELEPHONE_ASSESSMENT:
        return APPLICATION_STATUS.TELEPHONE_ASSESSMENT_PASSED;
      case APPLICATION_STATUS.FAILED_TELEPHONE_ASSESSMENT:
        return APPLICATION_STATUS.TELEPHONE_ASSESSMENT_FAILED;
      case APPLICATION_STATUS.INVITED_TO_SELECTION_DAY:
        return APPLICATION_STATUS.SHORTLISTING_PASSED;
      case APPLICATION_STATUS.REJECTED_AS_INELIGIBLE:
        return APPLICATION_STATUS.REJECTED_INELIGIBLE_ADDITIONAL;
      case APPLICATION_STATUS.PASSED_SELECTION:
        return APPLICATION_STATUS.SELECTION_DAY_PASSED;
      case APPLICATION_STATUS.FAILED_SELECTION:
        return APPLICATION_STATUS.SELECTION_DAY_FAILED;
      case APPLICATION_STATUS.REJECTED_BY_CHARACTER:
        return APPLICATION_STATUS.REJECTED_CHARACTER;
      case APPLICATION_STATUS.PASSED_BUT_NOT_RECOMMENDED:
        return APPLICATION_STATUS.PASSED_RECOMMENDED;
      case APPLICATION_STATUS.APPROVED_FOR_IMMEDIATE_APPOINTMENT:
        return APPLICATION_STATUS.APPROVED_IMMEDIATE;
      case APPLICATION_STATUS.APPROVED_FOR_FUTURE_APPOINTMENT:
        return APPLICATION_STATUS.APPROVED_FUTURE;
      case APPLICATION_STATUS.SCC_TO_RECONSIDER:
        return APPLICATION_STATUS.RECONSIDER;
      case APPLICATION_STATUS.WITHDREW_APPLICATION:
        return APPLICATION_STATUS.WITHDRAWN;
      case APPLICATION_STATUS.SUBMITTED_FIRST_TEST:
      default:
        return '';
    }
  }

  /**
   * Get stage and status for the application record based on the version
   * 
   * @param {object} applicationRecord 
   * @param {number} version 
   * @returns 
   */
  function getStageStatus(applicationRecord, version) {
    const payload = {};

    if (version === 1 && applicationRecord._backups && applicationRecord._backups.processingVersion1) {
      const { stage, status, stageLog, statusLog } = applicationRecord._backups.processingVersion1;
      if (stage && applicationRecord.stage !== stage) payload.stage = stage;
      if (stageLog) payload.stageLog = stageLog;
      if (status && applicationRecord.status !== status) payload.status = status;
      if (statusLog) payload.statusLog = statusLog;

      // remove back up stage and status
      payload['_backups.processingVersion1'] = firebase.firestore.FieldValue.delete();
    } else if (version === 2) {
      // back up stage and status
      payload['_backups.processingVersion1.stage'] = applicationRecord.stage || '';
      payload['_backups.processingVersion1.stageLog'] = applicationRecord.stageLog || {};
      payload['_backups.processingVersion1.status'] = applicationRecord.status || '';
      payload['_backups.processingVersion1.statusLog'] = applicationRecord.statusLog || {};

      // update stage
      payload.stage = convertStageToVersion2(applicationRecord.stage);

      if (applicationRecord.stageLog && Object.keys(applicationRecord.stageLog).length) {
        payload.stageLog = {};
        Object.entries(applicationRecord.stageLog)
          .sort((a, b) => a[1] - b[1]) // sort by timestamp in ascending order
          .forEach(([stage, timestamp]) => {
            const newStage = convertStageToVersion2(stage);
            if (newStage && !payload.stageLog[newStage]) {
              // only update if the new stage is not already in the stageLog
              payload.stageLog[newStage] = timestamp;
            }
        });
      }

      // update status
      payload.status = convertStatusToVersion2(applicationRecord.status);

      if (applicationRecord.statusLog && Object.keys(applicationRecord.statusLog).length) {
        payload.statusLog = {};
        Object.entries(applicationRecord.statusLog)
          .sort((a, b) => a[1] - b[1]) // sort by timestamp in ascending order
          .forEach(([status, timestamp]) => {
            const newStatus = convertStatusToVersion2(status);
            if (newStatus && !payload.statusLog[newStatus]) {
              // only update if the new stage is not already in the stageLog
              payload.statusLog[newStatus] = timestamp;
            }
        });
      }
    }

    return payload;
  }
};
