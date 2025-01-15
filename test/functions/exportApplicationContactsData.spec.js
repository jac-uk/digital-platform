import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import exportApplicationContactsData from '../../functions/callableFunctions/exportApplicationContactsData.js';

const { wrap } = firebaseFunctionsTest;

describe('exportApplicationContactsData', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(exportApplicationContactsData);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(exportApplicationContactsData);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.exercises.permissions.canReadExercises.value,
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
