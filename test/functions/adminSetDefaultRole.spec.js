import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import adminSetDefaultRole from '../../functions/callableFunctions/adminSetDefaultRole.js';

const { wrap } = firebaseFunctionsTest;

describe('adminSetDefaultRole', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(adminSetDefaultRole);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(adminSetDefaultRole);
      const context = generateMockContext({
        permissions: [PERMISSIONS.users.permissions.canEditRolePermissions.value],
      });
      try {
        await wrapped({}, context);
      } catch (e) {
        assert.equal(e.code, 'invalid-argument');
      }
    });
  });
});
