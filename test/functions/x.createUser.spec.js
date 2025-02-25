import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import createUser from '../../functions/callableFunctions/x.createUser.js';

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
