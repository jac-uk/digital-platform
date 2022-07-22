const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const initialiseMissingApplicationRecords = require('../../functions/callableFunctions/initialiseMissingApplicationRecords');

const { wrap } = firebaseFunctionsTest;

describe('initialiseMissingApplicationRecords', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(initialiseMissingApplicationRecords);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(initialiseMissingApplicationRecords);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.exercises.permissions.canReadExercises.value,
          PERMISSIONS.exercises.permissions.canUpdateExercises.value,
          PERMISSIONS.applications.permissions.canReadApplications.value,
          PERMISSIONS.applicationRecords.permissions.canCreateApplicationRecords.value,
          PERMISSIONS.qualifyingTests.permissions.canReadQualifyingTests.value,
          PERMISSIONS.qualifyingTestResponses.permissions.canCreateQualifyingTestResponses.value,
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
