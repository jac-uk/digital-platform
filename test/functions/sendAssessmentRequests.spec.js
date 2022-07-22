const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const sendAssessmentRequests = require('../../functions/callableFunctions/sendAssessmentRequests');

const { wrap } = firebaseFunctionsTest;

describe('sendAssessmentRequests', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(sendAssessmentRequests);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(sendAssessmentRequests);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.exercises.permissions.canReadExercises.value,
          PERMISSIONS.exercises.permissions.canUpdateExercises.value,
          PERMISSIONS.assessments.permissions.canReadAssessments.value,
          PERMISSIONS.assessments.permissions.canUpdateAssessments.value,
          PERMISSIONS.notifications.permissions.canCreateNotifications.value,
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
