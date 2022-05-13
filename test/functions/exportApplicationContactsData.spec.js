const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const exportApplicationContactsData = require('../../functions/callableFunctions/exportApplicationContactsData');

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
          PERMISSIONS.logs.permissions.canCreateLogs.value,
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
