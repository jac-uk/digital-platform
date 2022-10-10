const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const createUser = require('../../functions/callableFunctions/createUser');

const { wrap } = firebaseFunctionsTest;

describe('createUser', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(createUser);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(createUser);
      const context = generateMockContext({
        permissions: [PERMISSIONS.users.permissions.canCreateUsers.value],
      });
      try {
        await wrapped({}, context);
      } catch (e) {
        assert.equal(e.code, 'invalid-argument');
      }
    });
  });
});
