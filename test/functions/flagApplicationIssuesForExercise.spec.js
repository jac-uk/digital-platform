import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import flagApplicationIssuesForExercise from '../../functions/callableFunctions/flagApplicationIssuesForExercise.js';

const { wrap } = firebaseFunctionsTest;

describe('flagApplicationIssuesForExercise', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(flagApplicationIssuesForExercise);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(flagApplicationIssuesForExercise);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.exercises.permissions.canReadExercises.value,
          PERMISSIONS.applications.permissions.canReadApplications.value,
          PERMISSIONS.applicationRecords.permissions.canUpdateApplicationRecords.value,
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
