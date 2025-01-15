import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import adminDisableUser from '../../functions/callableFunctions/adminDisableUser.js';

const { wrap } = firebaseFunctionsTest;

describe('adminDisableUser', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(adminDisableUser);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(adminDisableUser);
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
