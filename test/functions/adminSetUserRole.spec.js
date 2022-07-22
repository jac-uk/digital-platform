const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const adminSetUserRole = require('../../functions/callableFunctions/adminSetUserRole');

const { wrap } = firebaseFunctionsTest;

describe('adminSetUserRole', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(adminSetUserRole);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(adminSetUserRole);
      const context = generateMockContext({
        permissions: [PERMISSIONS.users.permissions.canChangeUserRole.value],
      });
      try {
        await wrapped({}, context);
      } catch (e) {
        assert.equal(e.code, 'invalid-argument');
      }
    });
  });
});
