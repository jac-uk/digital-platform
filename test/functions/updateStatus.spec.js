const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const updateStatus = require('../../functions/callableFunctions/updateStatus');

const { wrap } = firebaseFunctionsTest;

describe('updateStatus', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(updateStatus);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(updateStatus);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applicationRecords.permissions.canUpdateApplicationRecords.value,
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
