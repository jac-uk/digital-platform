const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const adminDisableUser = require('../../functions/callableFunctions/adminDisableUser');

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
