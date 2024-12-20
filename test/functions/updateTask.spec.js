import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import updateTask from '../../functions/callableFunctions/tasks/updateTask.js';

const { wrap } = firebaseFunctionsTest;

describe('updateTask', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(updateTask);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(updateTask);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.tasks.permissions.canUpdate.value,
        ],
      });
      try {
        await wrapped({}, context);
      } catch (e) {
        assert.equal(e.code, 'invalid-argument');
      }
    });
  });
});
