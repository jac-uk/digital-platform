import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import customReport from '../../functions/callableFunctions/customReport.js';

const { wrap } = firebaseFunctionsTest;

describe('customReport', () => {
  context('Permission', () => {
    it('has no permission', async () => {
      const wrapped = wrap(customReport);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });

    it('has permission', async () => {
      const wrapped = wrap(customReport);
      const context = generateMockContext({
        uid: '123',
        permissions: [PERMISSIONS.applications.permissions.canReadApplications.value],
      });

      // Test that no permission-denied error is thrown
      try {
        await wrapped({}, context);
        assert(true, 'Function executed without permission-denied error');
      } catch (e) {
        assert.fail(`Permission denied error should not be thrown: ${e.message}`);
      }
    });
  });
});
