import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import cancelAssessments from '../../functions/callableFunctions/cancelAssessments.js';

const { wrap } = firebaseFunctionsTest;

describe('cancelAssessments', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(cancelAssessments);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(cancelAssessments);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.assessments.permissions.canReadAssessments.value,
          PERMISSIONS.assessments.permissions.canUpdateAssessments.value,
          PERMISSIONS.exercises.permissions.canUpdateExercises.value,
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
