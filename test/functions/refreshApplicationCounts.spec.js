const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const refreshApplicationCounts = require('../../functions/callableFunctions/refreshApplicationCounts');

const { wrap } = firebaseFunctionsTest;

describe('refreshApplicationCounts', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(refreshApplicationCounts);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(refreshApplicationCounts);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.exercises.permissions.canReadExercises.value,
          PERMISSIONS.exercises.permissions.canUpdateExercises.value,
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
