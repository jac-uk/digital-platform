const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const testAssessmentNotification = require('../../functions/callableFunctions/testAssessmentNotification');

const { wrap } = firebaseFunctionsTest;

describe('testAssessmentNotification', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(testAssessmentNotification);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(testAssessmentNotification);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.assessments.permissions.canReadAssessments.value,
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
