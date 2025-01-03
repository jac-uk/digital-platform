import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import sendPublishedFeedbackReportNotifications from '../../functions/callableFunctions/sendPublishedFeedbackReportNotifications.js';

const { wrap } = firebaseFunctionsTest;

describe('sendPublishedFeedbackReportNotifications', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(sendPublishedFeedbackReportNotifications);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(sendPublishedFeedbackReportNotifications);
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
