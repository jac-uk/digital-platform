const assert = require('assert');
const { firebaseFunctionsTest, generateMockContext } = require('./helpers');
const { PERMISSIONS } = require('../../functions/shared/permissions');
const generateQualifyingTestReport = require('../../functions/callableFunctions/generateQualifyingTestReport');

const { wrap } = firebaseFunctionsTest;

describe('generateQualifyingTestReport', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(generateQualifyingTestReport);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
    it ('has permission', async () => {
      const wrapped = wrap(generateQualifyingTestReport);
      const context = generateMockContext({
        permissions: [
          PERMISSIONS.qualifyingTestReports.permissions.canReadQualifyingTestReports.value,
          PERMISSIONS.qualifyingTestReports.permissions.canUpdateQualifyingTestReports.value,
          PERMISSIONS.applications.permissions.canReadApplications.value,
          PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
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
