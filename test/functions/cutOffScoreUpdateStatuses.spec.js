const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const cutOffScoreUpdateStatuses = require('../../functions/callableFunctions/cutOffScoreUpdateStatuses');

const { wrap } = firebaseFunctionsTest;

describe('cutOffScoreUpdateStatuses', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(cutOffScoreUpdateStatuses);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(cutOffScoreUpdateStatuses);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
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
