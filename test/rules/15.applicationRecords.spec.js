import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

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
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.applicationRecords.permissions.canCreateApplicationRecords.value] });
      await assertSucceeds(db.collection('applicationRecords').add({}));
    });
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading applicationRecords', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('applicationRecords').get());
    });

    it('allow JAC admin with permission to read applicationRecords', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value] });
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
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.applicationRecords.permissions.canUpdateApplicationRecords.value] },
        { 'applicationRecords/record1': {} }
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
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.applicationRecords.permissions.canDeleteApplicationRecords.value] },
        { 'applicationRecords/record1': {} }
      );
      await assertSucceeds(db.collection('applicationRecords').doc('record1').delete());
    });
  });

});
