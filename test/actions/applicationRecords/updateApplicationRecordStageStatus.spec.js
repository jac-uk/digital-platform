const mockFirebase = require('firebase-admin');
const mockDB = jest.fn();
const config = require('../../../nodeScripts/shared/config');

const { convertStageToVersion2, convertStatusToVersion2 } = require('../../../functions/actions/applicationRecords/updateApplicationRecordStageStatus')(mockFirebase, config, mockDB);

describe('Update stages to version 2', () => {
  const { EXERCISE_STAGE } = config;
  const expectedMappings = [
    { v1: EXERCISE_STAGE.REVIEW, v2: EXERCISE_STAGE.SHORTLISTING },
    { v1: EXERCISE_STAGE.APPLIED, v2: EXERCISE_STAGE.SHORTLISTING },
    { v1: EXERCISE_STAGE.SHORTLISTED, v2: EXERCISE_STAGE.SHORTLISTING },
    { v1: EXERCISE_STAGE.SELECTED, v2: EXERCISE_STAGE.SELECTION },
    { v1: EXERCISE_STAGE.SELECTABLE, v2: EXERCISE_STAGE.SELECTION },
    { v1: EXERCISE_STAGE.RECOMMENDED, v2: EXERCISE_STAGE.SCC },
    { v1: EXERCISE_STAGE.HANDOVER, v2: EXERCISE_STAGE.RECOMMENDATION },
  ];

  expectedMappings.forEach(map => {
    it(`${map.v1} should become ${map.v2}`, async () => {
      expect(convertStageToVersion2(map.v1)).toEqual(map.v2);
    });
  });

});


describe('Update status to version 2', () => {
  const { APPLICATION_STATUS } = config;
  const expectedMappings = [
    { v1: APPLICATION_STATUS.CRITICAL_ANALYSIS_PASSED, v2: APPLICATION_STATUS.CRITICAL_ANALYSIS_PASSED },
    { v1: APPLICATION_STATUS.CRITICAL_ANALYSIS_FAILED, v2: APPLICATION_STATUS.QUALIFYING_TEST_FAILED },
    { v1: APPLICATION_STATUS.SITUATIONAL_JUDGEMENT_PASSED, v2: APPLICATION_STATUS.SITUATIONAL_JUDGEMENT_PASSED },
    { v1: APPLICATION_STATUS.SITUATIONAL_JUDGEMENT_FAILED, v2: APPLICATION_STATUS.QUALIFYING_TEST_FAILED },
    { v1: APPLICATION_STATUS.PASSED_SIFT, v2: APPLICATION_STATUS.SIFT_PASSED },
    { v1: APPLICATION_STATUS.FAILED_SIFT, v2: APPLICATION_STATUS.SIFT_FAILED },
    { v1: APPLICATION_STATUS.SUBMITTED_FIRST_TEST, v2: APPLICATION_STATUS.QUALIFYING_TEST_FAILED },
    { v1: APPLICATION_STATUS.FAILED_FIRST_TEST, v2: APPLICATION_STATUS.QUALIFYING_TEST_FAILED },
    { v1: APPLICATION_STATUS.SUBMITTED_SCENARIO_TEST, v2: APPLICATION_STATUS.SCENARIO_TEST_FAILED },
    { v1: APPLICATION_STATUS.PASSED_FIRST_TEST, v2: APPLICATION_STATUS.QUALIFYING_TEST_PASSED },
    { v1: APPLICATION_STATUS.FAILED_SCENARIO_TEST, v2: APPLICATION_STATUS.SCENARIO_TEST_FAILED },
    { v1: APPLICATION_STATUS.PASSED_SCENARIO_TEST, v2: APPLICATION_STATUS.SCENARIO_TEST_PASSED },
    { v1: APPLICATION_STATUS.FAILED_TELEPHONE_ASSESSMENT, v2: APPLICATION_STATUS.TELEPHONE_ASSESSMENT_FAILED },
    { v1: APPLICATION_STATUS.PASSED_TELEPHONE_ASSESSMENT, v2: APPLICATION_STATUS.TELEPHONE_ASSESSMENT_PASSED },
    { v1: APPLICATION_STATUS.NO_TEST_SUBMITTED, v2: APPLICATION_STATUS.QUALIFYING_TEST_NOT_SUBMITTED },
    { v1: APPLICATION_STATUS.TEST_SUBMITTED_OVER_TIME, v2: APPLICATION_STATUS.QUALIFYING_TEST_FAILED },
    { v1: APPLICATION_STATUS.WITHDREW_APPLICATION, v2: APPLICATION_STATUS.WITHDRAWN },
    { v1: APPLICATION_STATUS.REJECTED_AS_INELIGIBLE, v2: APPLICATION_STATUS.REJECTED_INELIGIBLE_ADDITIONAL },
    { v1: APPLICATION_STATUS.INVITED_TO_SELECTION_DAY, v2: APPLICATION_STATUS.SHORTLISTING_PASSED },
    { v1: APPLICATION_STATUS.PASSED_SELECTION, v2: APPLICATION_STATUS.SELECTION_DAY_PASSED },
    { v1: APPLICATION_STATUS.FAILED_SELECTION, v2: APPLICATION_STATUS.SELECTION_DAY_FAILED },
    { v1: APPLICATION_STATUS.PASSED_BUT_NOT_RECOMMENDED, v2: APPLICATION_STATUS.PASSED_NOT_RECOMMENDED },
    { v1: APPLICATION_STATUS.REJECTED_BY_CHARACTER, v2: APPLICATION_STATUS.REJECTED_CHARACTER }, // crossed out on spreadsheet
    { v1: APPLICATION_STATUS.APPROVED_FOR_IMMEDIATE_APPOINTMENT, v2: APPLICATION_STATUS.APPROVED_IMMEDIATE },
    { v1: APPLICATION_STATUS.APPROVED_FOR_FUTURE_APPOINTMENT, v2: APPLICATION_STATUS.APPROVED_FUTURE },
    { v1: APPLICATION_STATUS.SCC_TO_RECONSIDER, v2: APPLICATION_STATUS.RECONSIDER },
    // { v1: APPLICATION_STATUS.XX, v2: APPLICATION_STATUS.YY },
  ];

  expectedMappings.forEach(map => {
    it(`${map.v1} should become ${map.v2}`, async () => {
      expect(convertStatusToVersion2(map.v1)).toEqual(map.v2);
    });
  });

});