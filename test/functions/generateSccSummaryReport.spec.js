import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import generateSccSummaryReport from '../../functions/callableFunctions/generateSccSummaryReport.js';

const { wrap } = firebaseFunctionsTest;

describe('generateSccSummaryReport', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(generateSccSummaryReport);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(generateSccSummaryReport);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.exercises.permissions.canReadExercises.value,
          PERMISSIONS.applications.permissions.canReadApplications.value,
          PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
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
