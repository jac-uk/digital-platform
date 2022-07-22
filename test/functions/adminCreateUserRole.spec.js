const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const adminCreateUserRole = require('../../functions/callableFunctions/adminCreateUserRole');

const { wrap } = firebaseFunctionsTest;

describe('adminCreateUserRole', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(adminCreateUserRole);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(adminCreateUserRole);
      const context = generateMockContext({
        permissions: [PERMISSIONS.users.permissions.canCreateRoles.value],
      });
      try {
        await wrapped({}, context);
      } catch (e) {
        assert.equal(e.code, 'invalid-argument');
      }
    });
  });
});
