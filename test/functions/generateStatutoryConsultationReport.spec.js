import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import generateStatutoryConsultationReport from '../../functions/callableFunctions/generateStatutoryConsultationReport.js';

const { wrap } = firebaseFunctionsTest;

describe('generateStatutoryConsultationReport', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(generateStatutoryConsultationReport);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(generateStatutoryConsultationReport);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applications.permissions.canReadApplications.value,
          PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
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
