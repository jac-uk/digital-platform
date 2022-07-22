const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const activateQualifyingTest = require('../../functions/callableFunctions/activateQualifyingTest');

const { wrap } = firebaseFunctionsTest;

describe('activateQualifyingTest', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(activateQualifyingTest);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(activateQualifyingTest);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.qualifyingTests.permissions.canReadQualifyingTests.value,
          PERMISSIONS.qualifyingTests.permissions.canUpdateQualifyingTests.value,
          PERMISSIONS.qualifyingTestResponses.permissions.canReadQualifyingTestResponses.value,
          PERMISSIONS.qualifyingTestResponses.permissions.canUpdateQualifyingTestResponses.value,
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
