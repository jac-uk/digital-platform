import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import adminUpdateUserRole from '../../functions/callableFunctions/adminUpdateUserRole.js';

const { wrap } = firebaseFunctionsTest;

describe('adminUpdateUserRole', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(adminUpdateUserRole);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(adminUpdateUserRole);
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
