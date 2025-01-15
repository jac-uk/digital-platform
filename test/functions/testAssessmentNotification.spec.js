import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import testAssessmentNotification from '../../functions/callableFunctions/testAssessmentNotification.js';

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
