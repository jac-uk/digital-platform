import { getDocument, getDocuments, applyUpdates } from '../../shared/helpers.js';
import { EXERCISE_STAGE, APPLICATION_STATUS } from '../../shared/config.js';

export default (firebase, db) => {
  return {
    updateApplicationRecordStageStatus,
    getApplicationRecordStageStatus,
    getExerciseApplicationRecords,
    convertStageToVersion2,
    convertStatusToVersion2,
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
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    if (exercise._processingVersion >= 3) return false; // do not update status for version 3+

    // get application records from reference numbers
    const ref = db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .select('_backups', 'stage', 'stageLog', 'status', 'statusLog');
    const applicationRecords = await getDocuments(ref);

    // construct db commands
    const commands = [];
    for (let i = 0, len = applicationRecords.length; i < len; ++i) {
      const applicationRecord = applicationRecords[i];
      const payload = getApplicationRecordStageStatus(applicationRecord, version);

      if (Object.keys(payload).length) {
        commands.push({
          command: 'update',
          ref: applicationRecord.ref,
          data: payload,
        });
      }
    }

    // update count of applicationRecords in exercise
    const exercisePayload = getExerciseApplicationRecords(exercise, version);
    if (Object.keys(exercisePayload).length) {
      commands.push({
        command: 'update',
        ref: exercise.ref,
        data: exercisePayload,
      });
    }

    // write to db
    const result = await applyUpdates(db, commands);

    // return
    return result ? commands.length : false;
  }

  function convertStageToVersion2(stage) {

    switch (stage) {
      // Version 2 stages should remain unchanged
      case EXERCISE_STAGE.SHORTLISTING:
      case EXERCISE_STAGE.SELECTION:
      case EXERCISE_STAGE.SCC:
      case EXERCISE_STAGE.RECOMMENDATION:
        return stage;
      // Version 1 stages should be converted
      case EXERCISE_STAGE.APPLIED:
      case EXERCISE_STAGE.REVIEW:
        return EXERCISE_STAGE.SHORTLISTING;
      case EXERCISE_STAGE.SHORTLISTED:
        return EXERCISE_STAGE.SHORTLISTING;
      case EXERCISE_STAGE.SELECTABLE:
      case EXERCISE_STAGE.SELECTED:
        return EXERCISE_STAGE.SELECTION;
      case EXERCISE_STAGE.RECOMMENDED:
        return EXERCISE_STAGE.SCC;
      case EXERCISE_STAGE.HANDOVER:
        return EXERCISE_STAGE.RECOMMENDATION;
      // Unknown stages should become empty string
      default:
        return '';
    }
  }

  function convertStatusToVersion2(status) {
    switch (status) {
      // Version 2 statuses should remain unchanged
      case APPLICATION_STATUS.CRITICAL_ANALYSIS_PASSED:
      case APPLICATION_STATUS.SITUATIONAL_JUDGEMENT_PASSED:
      case APPLICATION_STATUS.QUALIFYING_TEST_PASSED:
      case APPLICATION_STATUS.QUALIFYING_TEST_FAILED:
      case APPLICATION_STATUS.QUALIFYING_TEST_NOT_SUBMITTED:
      case APPLICATION_STATUS.SCENARIO_TEST_PASSED:
      case APPLICATION_STATUS.SCENARIO_TEST_FAILED:
      case APPLICATION_STATUS.SCENARIO_TEST_NOT_SUBMITTED:
      case APPLICATION_STATUS.SIFT_PASSED:
      case APPLICATION_STATUS.SIFT_FAILED:
      case APPLICATION_STATUS.TELEPHONE_ASSESSMENT_PASSED:
      case APPLICATION_STATUS.TELEPHONE_ASSESSMENT_FAILED:
      case APPLICATION_STATUS.SHORTLISTING_PASSED:
      case APPLICATION_STATUS.SHORTLISTING_FAILED:
      case APPLICATION_STATUS.FULL_APPLICATION_NOT_SUBMITTED:
      case APPLICATION_STATUS.ELIGIBILITY_SCC_PASSED:
      case APPLICATION_STATUS.ELIGIBILITY_SCC_FAILED:
      case APPLICATION_STATUS.CHARACTER_AND_SELECTION_SCC_PASSED:
      case APPLICATION_STATUS.CHARACTER_AND_SELECTION_SCC_FAILED:
      case APPLICATION_STATUS.STATUTORY_CONSULTATION_PASSED:
      case APPLICATION_STATUS.STATUTORY_CONSULTATION_FAILED:
      case APPLICATION_STATUS.SELECTION_INVITED:
      case APPLICATION_STATUS.REJECTED_INELIGIBLE_STATUTORY:
      case APPLICATION_STATUS.REJECTED_INELIGIBLE_ADDITIONAL:
      case APPLICATION_STATUS.REJECTED_CHARACTER:
      case APPLICATION_STATUS.SELECTION_DAY_PASSED:
      case APPLICATION_STATUS.SELECTION_DAY_FAILED:
      case APPLICATION_STATUS.SELECTION_PASSED:
      case APPLICATION_STATUS.SELECTION_FAILED:
      case APPLICATION_STATUS.SELECTION_OUTCOME_PASSED:
      case APPLICATION_STATUS.SELECTION_OUTCOME_FAILED:
      case APPLICATION_STATUS.PASSED_RECOMMENDED:
      case APPLICATION_STATUS.PASSED_NOT_RECOMMENDED:
      case APPLICATION_STATUS.RECOMMENDED_IMMEDIATE:
      case APPLICATION_STATUS.RECOMMENDED_FUTURE:
      case APPLICATION_STATUS.RECONSIDER:
      case APPLICATION_STATUS.SECOND_STAGE_INVITED:
      case APPLICATION_STATUS.SECOND_STAGE_PASSED:
      case APPLICATION_STATUS.SECOND_STAGE_FAILED:
      case APPLICATION_STATUS.APPROVED_IMMEDIATE:
      case APPLICATION_STATUS.APPROVED_FUTURE:
      case APPLICATION_STATUS.WITHDRAWN:
        return status;

      // Tidy up version 2 statuses
      case APPLICATION_STATUS.CRITICAL_ANALYSIS_FAILED:
      case APPLICATION_STATUS.SITUATIONAL_JUDGEMENT_FAILED:
        return APPLICATION_STATUS.QUALIFYING_TEST_FAILED;

      // Version 1 statuses should be converted
      case APPLICATION_STATUS.PASSED_FIRST_TEST:
        return APPLICATION_STATUS.QUALIFYING_TEST_PASSED;
      case APPLICATION_STATUS.FAILED_FIRST_TEST:
      case APPLICATION_STATUS.SUBMITTED_FIRST_TEST:
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
        return APPLICATION_STATUS.PASSED_NOT_RECOMMENDED;
      case APPLICATION_STATUS.APPROVED_FOR_IMMEDIATE_APPOINTMENT:
        return APPLICATION_STATUS.APPROVED_IMMEDIATE;
      case APPLICATION_STATUS.APPROVED_FOR_FUTURE_APPOINTMENT:
        return APPLICATION_STATUS.APPROVED_FUTURE;
      case APPLICATION_STATUS.SCC_TO_RECONSIDER:
        return APPLICATION_STATUS.RECONSIDER;
      case APPLICATION_STATUS.WITHDREW_APPLICATION:
        return APPLICATION_STATUS.WITHDRAWN;

      // Unknown status should be removed (empty string)
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
  function getApplicationRecordStageStatus(applicationRecord, version) {
    const payload = {};

    if (version === 1 && applicationRecord._backups && applicationRecord._backups.processingVersion1) {
      const { stage, status, stageLog, statusLog } = applicationRecord._backups.processingVersion1;
      if (stage && applicationRecord.stage !== stage) payload.stage = stage;
      if (stageLog) payload.stageLog = stageLog;
      if (status && applicationRecord.status !== status) payload.status = status;
      if (statusLog) payload.statusLog = statusLog;

      // remove back up stage and status
      payload['_backups.processingVersion1'] = firebase.firestore.FieldValue.delete();
    } else if (version === 2 && (!applicationRecord._backups || !applicationRecord._backups.processingVersion1)) {
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

        if (payload.status === APPLICATION_STATUS.CRITICAL_ANALYSIS_PASSED &&
          (payload.statusLog[APPLICATION_STATUS.SITUATIONAL_JUDGEMENT_FAILED] ||
            payload.statusLog[APPLICATION_STATUS.QUALIFYING_TEST_NOT_SUBMITTED] ||
            payload.statusLog[APPLICATION_STATUS.QUALIFYING_TEST_FAILED])
        ) {
          payload.status = APPLICATION_STATUS.QUALIFYING_TEST_FAILED;
          payload.statusLog[APPLICATION_STATUS.QUALIFYING_TEST_FAILED] = payload.statusLog[APPLICATION_STATUS.CRITICAL_ANALYSIS_PASSED];
          delete payload.statusLog[APPLICATION_STATUS.CRITICAL_ANALYSIS_PASSED];
          delete payload.statusLog[APPLICATION_STATUS.SITUATIONAL_JUDGEMENT_FAILED];
        }

        if (payload.status === APPLICATION_STATUS.SITUATIONAL_JUDGEMENT_PASSED &&
          (payload.statusLog[APPLICATION_STATUS.CRITICAL_ANALYSIS_FAILED] ||
            payload.statusLog[APPLICATION_STATUS.QUALIFYING_TEST_NOT_SUBMITTED] ||
            payload.statusLog[APPLICATION_STATUS.QUALIFYING_TEST_FAILED])
        ) {
          payload.status = APPLICATION_STATUS.QUALIFYING_TEST_FAILED;
          payload.statusLog[APPLICATION_STATUS.QUALIFYING_TEST_FAILED] = payload.statusLog[APPLICATION_STATUS.SITUATIONAL_JUDGEMENT_PASSED];
          delete payload.statusLog[APPLICATION_STATUS.SITUATIONAL_JUDGEMENT_PASSED];
          delete payload.statusLog[APPLICATION_STATUS.CRITICAL_ANALYSIS_FAILED];
        }
      }
    }

    return payload;
  }

  /**
   * Get new value of _applicationRecords in exercise based on the version
   *
   * @param {object} exercise
   * @param {number} version
   * @returns
   */
  function getExerciseApplicationRecords(exercise, version) {
    const payload = {};
    if (version === 1 && exercise._backups && exercise._backups.processingVersion1) {
      const { _applicationRecords } = exercise._backups.processingVersion1;
      if (_applicationRecords) {
        payload._applicationRecords = _applicationRecords;
      }
      // remove back up
      payload['_backups.processingVersion1'] = firebase.firestore.FieldValue.delete();
    } else if (version === 2 && (!exercise._backups || !exercise._backups.processingVersion1)) {
      // back up
      payload['_backups.processingVersion1._applicationRecords'] = exercise._applicationRecords || {};

      if (exercise._applicationRecords) {
        Object.entries(exercise._applicationRecords).forEach(([key, value]) => {
          const newStage = convertStageToVersion2(key);
          if (newStage) {
            if (payload[`_applicationRecords.${newStage}`]) {
              payload[`_applicationRecords.${newStage}`] += value;
            } else {
              payload[`_applicationRecords.${newStage}`] = value;
            }
            payload[`_applicationRecords.${key}`] = firebase.firestore.FieldValue.delete();
          }
        });
      }
    }

    return payload;
  }
};
