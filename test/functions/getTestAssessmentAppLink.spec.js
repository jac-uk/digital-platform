import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import getTestAssessmentAppLink from '../../functions/callableFunctions/getTestAssessmentAppLink.js';

const { wrap } = firebaseFunctionsTest;

describe('getTestAssessmentAppLink', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(getTestAssessmentAppLink);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(getTestAssessmentAppLink);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.exercises.permissions.canReadExercises.value,
          PERMISSIONS.exercises.permissions.canUpdateExercises.value,
          PERMISSIONS.assessments.permissions.canReadAssessments.value,
          PERMISSIONS.assessments.permissions.canUpdateAssessments.value,
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
