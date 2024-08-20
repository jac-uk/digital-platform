import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import deleteUsers from '../../functions/callableFunctions/deleteUsers.js';

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
