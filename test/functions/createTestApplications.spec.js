import assert from 'assert';
import esmock from 'esmock';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

const { wrap } = firebaseFunctionsTest;

describe('createTestApplications', () => {
  let createTestApplications;
  let wrapped;

  beforeEach(async () => {
    // Mock the `isProduction` function dynamically for each test
    createTestApplications = await esmock('../../functions/callableFunctions/createTestApplications.js', {
      '../../functions/shared/helpers.js': {
        isProduction: () => true, // Default behavior (can override per test)
      },
    });

    wrapped = wrap(createTestApplications);
  });

  afterEach(() => {
    esmock.purge(); // Clean up mocks after each test
  });

  context('Permission', () => {
    it('should fail if in production', async () => {
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'failed-precondition');
        assert.equal(e.message, 'The function must not be called on production.');
      }
    });

    it('should fail if user has no permission', async () => {
      // Remock `isProduction` to return false
      createTestApplications = await esmock('../../functions/callableFunctions/createTestApplications.js', {
        '../../functions/shared/helpers.js': {
          isProduction: () => false, // Mock as not in production
        },
      });

      wrapped = wrap(createTestApplications);

      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });

    it('should fail with invalid argument if user has permission but no data', async () => {
      // Remock `isProduction` to return false
      createTestApplications = await esmock('../../functions/callableFunctions/createTestApplications.js', {
        '../../functions/shared/helpers.js': {
          isProduction: () => false, // Mock as not in production
        },
      });

      wrapped = wrap(createTestApplications);

      const context = generateMockContext({
        permissions: [PERMISSIONS.applications.permissions.canCreateTestApplications.value],
      });

      try {
        await wrapped({}, context);
      } catch (e) {
        assert.equal(e.code, 'invalid-argument');
      }
    });
  });
});
