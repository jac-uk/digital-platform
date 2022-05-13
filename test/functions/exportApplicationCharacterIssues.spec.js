const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const exportApplicationCharacterIssues = require('../../functions/callableFunctions/exportApplicationCharacterIssues');

const { wrap } = firebaseFunctionsTest;

describe('exportApplicationCharacterIssues', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(exportApplicationCharacterIssues);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(exportApplicationCharacterIssues);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
          PERMISSIONS.applications.permissions.canReadApplications.value,
          PERMISSIONS.exercises.permissions.canReadExercises.value,
          PERMISSIONS.logs.permissions.canCreateLogs.value,
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
