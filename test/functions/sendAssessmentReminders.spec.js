import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import sendAssessmentReminders from '../../functions/callableFunctions/sendAssessmentReminders.js';

const { wrap } = firebaseFunctionsTest;

describe('sendAssessmentReminders', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(sendAssessmentReminders);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(sendAssessmentReminders);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.assessments.permissions.canReadAssessments.value,
          PERMISSIONS.notifications.permissions.canCreateNotifications.value,
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
