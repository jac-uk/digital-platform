import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import getApplicationData from '../../functions/callableFunctions/getApplicationData.js';

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
