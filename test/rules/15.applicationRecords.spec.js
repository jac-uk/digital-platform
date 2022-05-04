const { setup, teardown, mockRoleId, getEnabledPermissions } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const PERMISSIONS = require('../../functions/shared/permissions');

describe('ApplicationRecords', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent JAC admin without permission from creating applicationRecords', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('applicationRecords').add({}));
    });

    it('allow JAC admin with permission to create applicationRecords', async () => {
      const db = await setup(
        {
          uid: 'user1',
          email: 'user@judicialappointments.gov.uk',
          email_verified: true,
          ...mockRoleId,
        },
        getEnabledPermissions([PERMISSIONS.applicationRecords.permissions.canCreateApplicationRecords.value])
      );
      await assertSucceeds(db.collection('applicationRecords').add({}));
    });
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading applicationRecords', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('applicationRecords').get());
    });

    it('allow JAC admin with permission to read applicationRecords', async () => {
      const db = await setup(
        {
          uid: 'user1',
          email: 'user@judicialappointments.gov.uk',
          email_verified: true,
          ...mockRoleId,
        },
        getEnabledPermissions([PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value])
      );
      await assertSucceeds(db.collection('applicationRecords').get());
    });
  });

  context('Update', () => {
    it('prevent JAC admin without permission from updating applicationRecords', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'applicationRecords/record1': {} }
      );
      await assertFails(db.collection('applicationRecords').doc('record1').update({}));
    });

    it('allow JAC admin with permission to update applicationRecords', async () => {
      const db = await setup(
        {
          uid: 'user1',
          email: 'user@judicialappointments.gov.uk',
          email_verified: true,
          ...mockRoleId,
        },
        {
          ...getEnabledPermissions([PERMISSIONS.applicationRecords.permissions.canUpdateApplicationRecords.value]),
          'applicationRecords/record1': {},
        }
      );
      await assertSucceeds(db.collection('applicationRecords').doc('record1').update({}));
    });
  });

  context('Delete', () => {
    it('prevent JAC admin without permission from deleting applicationRecords', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'applicationRecords/record1': {} }
      );
      await assertFails(db.collection('applicationRecords').doc('record1').delete());
    });

    it('allow JAC admin with permission to delete applicationRecords', async () => {
      const db = await setup(
        {
          uid: 'user1',
          email: 'user@judicialappointments.gov.uk',
          email_verified: true,
          ...mockRoleId,
        },
        {
          ...getEnabledPermissions([PERMISSIONS.applicationRecords.permissions.canDeleteApplicationRecords.value]),
          'applicationRecords/record1': {},
        }
      );
      await assertSucceeds(db.collection('applicationRecords').doc('record1').delete());
    });
  });

});
