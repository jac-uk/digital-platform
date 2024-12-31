import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import adminDisableNewUser from '../../functions/callableFunctions/adminDisableNewUser.js';

const { wrap } = firebaseFunctionsTest;

describe('adminDisableNewUser', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(adminDisableNewUser);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(adminDisableNewUser);
      const context = generateMockContext({
        permissions: [PERMISSIONS.users.permissions.canEnableUsers.value],
      });
      try {
        await wrapped({}, context);
      } catch (e) {
        assert.equal(e.code, 'invalid-argument');
      }
    });
  });
});
