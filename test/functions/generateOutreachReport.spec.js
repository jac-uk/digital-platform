import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import generateOutreachReport from '../../functions/callableFunctions/generateOutreachReport.js';

const { wrap } = firebaseFunctionsTest;

describe('generateOutreachReport', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(generateOutreachReport);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(generateOutreachReport);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applications.permissions.canReadApplications.value,
          PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
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
