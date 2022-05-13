const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const sendQualifyingTestReminders = require('../../functions/callableFunctions/sendQualifyingTestReminders');

const { wrap } = firebaseFunctionsTest;

describe('sendQualifyingTestReminders', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(sendQualifyingTestReminders);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(sendQualifyingTestReminders);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.qualifyingTests.permissions.canReadQualifyingTests.value,
          PERMISSIONS.exercises.permissions.canReadExercises.value,
          PERMISSIONS.qualifyingTestResponses.permissions.canReadQualifyingTestResponses.value,
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
