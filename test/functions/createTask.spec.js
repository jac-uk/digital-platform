import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import createTask from '../../functions/callableFunctions/tasks/createTask.js';

const { wrap } = firebaseFunctionsTest;

describe('createTask', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(createTask);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(createTask);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.tasks.permissions.canCreate.value,
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
