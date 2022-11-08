const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const sendApplicationReminders = require('../../functions/callableFunctions/sendApplicationReminders');

const { wrap } = firebaseFunctionsTest;

describe('sendApplicationReminders', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(sendApplicationReminders);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(sendApplicationReminders);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applications.permissions.canReadApplications.value,
          PERMISSIONS.applications.permissions.canUpdateApplications.value,
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
