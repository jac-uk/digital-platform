const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const adminUpdateUserRole = require('../../functions/callableFunctions/adminUpdateUserRole');

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
