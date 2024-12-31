import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

describe('Panels', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent JAC admin without permission from creating panels', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('panels').add({}));
    });

    it('allow JAC admin with permission to create panels', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.panels.permissions.canCreatePanels.value] });
      await assertSucceeds(db.collection('panels').add({}));
    });
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading panels', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('panels').get());
    });

    it('allow JAC admin with permission to read panels', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.panels.permissions.canReadPanels.value] });
      await assertSucceeds(db.collection('panels').get());
    });
  });

  context('Update', () => {
    it('prevent JAC admin without permission from updating panels', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'panels/panel1': {} }
      );
      await assertFails(db.collection('panels').doc('panel1').update({}));
    });

    it('allow JAC admin with permission to update panels', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.panels.permissions.canUpdatePanels.value] },
        { 'panels/panel1': {} }
      );
      await assertSucceeds(db.collection('panels').doc('panel1').update({}));
    });
  });

  context('Delete', () => {
    it('prevent JAC admin without permission from deleting panels', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'panels/panel1': {} }
      );
      await assertFails(db.collection('panels').doc('panel1').delete());
    });

    it('allow JAC admin with permission to delete panels', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.panels.permissions.canDeletePanels.value] },
        { 'panels/panel1': {} }
      );
      await assertSucceeds(db.collection('panels').doc('panel1').delete());
    });
  });

});
