import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import resetAssessments from '../../functions/callableFunctions/resetAssessments.js';

const { wrap } = firebaseFunctionsTest;

describe('resetAssessments', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(resetAssessments);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(resetAssessments);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.assessments.permissions.canReadAssessments.value,
          PERMISSIONS.assessments.permissions.canUpdateAssessments.value,
          PERMISSIONS.exercises.permissions.canUpdateExercises.value,
        ],
      });
      try {
        await wrapped({
          exerciseId: { required: true },
          assessmentIds: { required: false },
          status: { required: false },
        }, context);
      } catch (e) {
        assert.equal(e.code, 'invalid-argument');
      }
    });
  });
});
