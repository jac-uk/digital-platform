const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const cancelAssessments = require('../../functions/callableFunctions/cancelAssessments');

const { wrap } = firebaseFunctionsTest;

describe('cancelAssessments', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(cancelAssessments);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(cancelAssessments);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.assessments.permissions.canReadAssessments.value,
          PERMISSIONS.assessments.permissions.canDeleteAssessments.value,
          PERMISSIONS.exercises.permissions.canUpdateExercises.value,
        ],
      });
      try {
        await wrapped({}, context);
      } catch (e) {
        assert.equal(e.code, 'invalid-argument');
      }
    });
  });
});
