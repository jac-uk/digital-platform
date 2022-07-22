const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const sendAssessmentReminders = require('../../functions/callableFunctions/sendAssessmentReminders');

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
