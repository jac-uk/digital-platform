import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import sendApplicationReminders from '../../functions/callableFunctions/sendApplicationReminders.js';

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
          PERMISSIONS.exercises.permissions.canSendApplicationReminders.value,
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
