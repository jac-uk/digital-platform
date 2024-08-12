import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import generateAgencyReport from '../../functions/callableFunctions/generateAgencyReport.js';

const { wrap } = firebaseFunctionsTest;

describe('generateAgencyReport', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(generateAgencyReport);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(generateAgencyReport);
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
