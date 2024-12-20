import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import exportSccSummaryReport from '../../functions/callableFunctions/exportSccSummaryReport.js';

const { wrap } = firebaseFunctionsTest;

describe('exportSccSummaryReport', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(exportSccSummaryReport);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(exportSccSummaryReport);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.exercises.permissions.canReadExercises.value,
          PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
          PERMISSIONS.applications.permissions.canReadApplications.value,
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
