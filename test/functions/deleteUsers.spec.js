const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const deleteUsers = require('../../functions/callableFunctions/deleteUsers');

const { wrap } = firebaseFunctionsTest;

describe('deleteUsers', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(deleteUsers);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(deleteUsers);
      const context = generateMockContext({
        permissions: [PERMISSIONS.users.permissions.canDeleteUsers.value],
      });
      try {
        await wrapped({}, context);
      } catch (e) {
        assert.equal(e.code, 'invalid-argument');
      }
    });
  });
});
