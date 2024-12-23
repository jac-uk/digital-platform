import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import sendCandidateFormNotifications from '../../functions/callableFunctions/sendCandidateFormNotifications.js';

const { wrap } = firebaseFunctionsTest;

describe('sendAssessmentReminders', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(sendCandidateFormNotifications);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(sendCandidateFormNotifications);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applications.permissions.canReadApplications.value,
          PERMISSIONS.applications.permissions.canUpdateApplications.value,
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
