const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const adminSetDefaultRole = require('../../functions/callableFunctions/adminSetDefaultRole');

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
