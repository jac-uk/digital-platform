import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import adminSetUserRole from '../../functions/callableFunctions/adminSetUserRole.js';

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
