const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const exportApplicationEligibilityIssues = require('../../functions/callableFunctions/exportApplicationEligibilityIssues');

const { wrap } = firebaseFunctionsTest;

describe('exportApplicationEligibilityIssues', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(exportApplicationEligibilityIssues);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(exportApplicationEligibilityIssues);
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
