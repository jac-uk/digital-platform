const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const getApplicationData = require('../../functions/callableFunctions/getApplicationData');

const { wrap } = firebaseFunctionsTest;

describe('getApplicationData', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(getApplicationData);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(getApplicationData);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applications.permissions.canReadApplications.value,
        ],
      });
      try {
        await wrapped({}, context);
      } catch (e) {
        assert.notEqual(e.code, 'permission-denied');
      }
    });
  });
});
