import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import exportApplicationCommissionerConflicts from '../../functions/callableFunctions/exportApplicationCommissionerConflicts.js';

const { wrap } = firebaseFunctionsTest;

describe('exportApplicationCommissionerConflicts', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(exportApplicationCommissionerConflicts);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(exportApplicationCommissionerConflicts);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applications.permissions.canReadApplications.value,
          PERMISSIONS.exercises.permissions.canReadExercises.value,
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
