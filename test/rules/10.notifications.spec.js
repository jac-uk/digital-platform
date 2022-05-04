const { setup, teardown, mockRoleId, getEnabledPermissions } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const PERMISSIONS = require('../../functions/shared/permissions');

describe('Notifications', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading notifications', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('notifications').get());
    });

    it('allow JAC admin with permission to read notifications', async () => {
      const db = await setup(
        {
          uid: 'user1',
          email: 'user@judicialappointments.gov.uk',
          email_verified: true,
          ...mockRoleId,
        },
        getEnabledPermissions([PERMISSIONS.notifications.permissions.canReadNotifications.value])
      );
      await assertSucceeds(db.collection('notifications').get());
    });
  });
});
