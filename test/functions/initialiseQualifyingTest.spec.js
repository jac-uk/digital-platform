const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const initialiseQualifyingTest = require('../../functions/callableFunctions/initialiseQualifyingTest');

const { wrap } = firebaseFunctionsTest;

describe('initialiseQualifyingTest', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(initialiseQualifyingTest);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(initialiseQualifyingTest);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.qualifyingTests.permissions.canReadQualifyingTests.value,
          PERMISSIONS.qualifyingTests.permissions.canUpdateQualifyingTests.value,
          PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
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
