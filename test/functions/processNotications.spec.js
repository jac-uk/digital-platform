import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import processNotifications from '../../functions/callableFunctions/processNotifications.js';

const { wrap } = firebaseFunctionsTest;

describe('processNotifications', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(processNotifications);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(processNotifications);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.notifications.permissions.canUpdateNotifications.value,
          PERMISSIONS.settings.permissions.canUpdateSettings.value,
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
