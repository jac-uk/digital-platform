import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import getMultipleApplicationData from '../../functions/callableFunctions/getMultipleApplicationData.js'; // Import the new function

const { wrap } = firebaseFunctionsTest;

describe('getMultipleApplicationData', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(getMultipleApplicationData);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });

    it ('has permission', async () => {
      const wrapped = wrap(getMultipleApplicationData);
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

  context('Functionality', () => {
    it('should return data for multiple exerciseIds', async () => {
      const exerciseIds = ['exerciseId1', 'exerciseId2', 'exerciseId3'];
      const columns = ['exerciseRef','referenceNumber'];

      const wrapped = wrap(getMultipleApplicationData);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applications.permissions.canReadApplications.value,
        ],
      });
      
      const result = await wrapped({ exerciseIds, columns }, context);
      assert(Array.isArray(result), 'Result should be an array');
      assert(result.length > 0, 'Result should contain data');
    });
  });
});
