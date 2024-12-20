import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import getMultipleApplicationData from '../../functions/callableFunctions/getMultipleApplicationData.js';

const { wrap } = firebaseFunctionsTest;

const exerciseIds = ['XvzIg48K9XOhfeFr3w91', 'Biyjd07Xz2usL9yXjtjV', 'IKLcf2Y187f2WTjifsoj'];  

const columns = ['exerciseRef','referenceNumber','personalDetails.fullName','status'];

describe('getMultipleApplicationData', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(getMultipleApplicationData(exerciseIds, columns));
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
          PERMISSIONS.exercises.permissions.canReadExercises.value,
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
