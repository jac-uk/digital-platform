import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';
import updateApplicationRecordStageStatus from '../../functions/callableFunctions/updateApplicationRecordStageStatus.js';

const { wrap } = firebaseFunctionsTest;

describe('updateApplicationRecordStageStatus', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(updateApplicationRecordStageStatus);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(updateApplicationRecordStageStatus);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
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
