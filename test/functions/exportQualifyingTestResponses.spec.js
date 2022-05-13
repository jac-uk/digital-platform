const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const exportQualifyingTestResponses = require('../../functions/callableFunctions/exportQualifyingTestResponses');

const { wrap } = firebaseFunctionsTest;

describe('exportQualifyingTestResponses', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(exportQualifyingTestResponses);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(exportQualifyingTestResponses);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.qualifyingTests.permissions.canReadQualifyingTests.value,
          PERMISSIONS.logs.permissions.canCreateLogs.value,
          PERMISSIONS.qualifyingTestResponses.permissions.canReadQualifyingTestResponses.value,
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
