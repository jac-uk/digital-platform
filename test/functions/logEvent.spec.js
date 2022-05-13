const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const logEvent = require('../../functions/callableFunctions/logEvent');

const { wrap } = firebaseFunctionsTest;

describe('logEvent', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(logEvent);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(logEvent);
      const context = generateMockContext({
        permissions: [
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
