import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

const newPanellistData = { fullName: 'test tester', jacEmail: 'test@test.com', phone: '07777000000', sex: 'female', ethnicity: 'White' };

describe('Panellists', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent un-authenticated user from creating a panellist', async () => {
      const db = await setup();
      await assertFails(db.collection('panellists').add(newPanellistData));
    });

    it('prevent authenticated user from creating a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('panellists').add(newPanellistData));
    });

    it('prevent authenticated user with verified email from creating a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('panellists').add(newPanellistData));
    });

    it('prevent authenticated user with un-verified JAC email from creating a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('panellists').add(newPanellistData));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to create a panellist with no data', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('panellists').add({}));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from creating a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('panellists').add(newPanellistData));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from creating a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('panellists').add(newPanellistData));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to create a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.panellists.permissions.canManagePanellists.value] });
      await assertSucceeds(db.collection('panellists').add(newPanellistData));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to create a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.panellists.permissions.canManagePanellists.value] });
      await assertSucceeds(db.collection('panellists').add(newPanellistData));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading panellists', async () => {
      const db = await setup();
      await assertFails(db.collection('panellists').get());
    });

    it('prevent authenticated user from reading panellists', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('panellists').get());
    });

    it('prevent authenticated user with verified email from reading panellists', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('panellists').get());
    });

    it('prevent authenticated user with un-verified JAC email from reading panellists', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('panellists').get());
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from reading panellists', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('panellists').get());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from reading panellists', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('panellists').get());
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to read users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.panellists.permissions.canManagePanellists.value] });
      await assertSucceeds(db.collection('panellists').get());
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to read users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.panellists.permissions.canManagePanellists.value] });
      await assertSucceeds(db.collection('panellists').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating a panellist', async () => {
      const db = await setup(null, { 'panellists/ux1': { } });
      await assertFails(db.collection('panellists').doc('ux1').update(newPanellistData));
    });

    it('prevent authenticated user from updating a panellist', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: false },
        { 'panellists/ux1': { } }
      );
      await assertFails(db.collection('panellists').doc('ux1').update(newPanellistData));
    });

    it('prevent authenticated user with verified email from updating a panellist', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: true },
        { 'panellists/ux1': { } }
      );
      await assertFails(db.collection('panellists').doc('ux1').update(newPanellistData));
    });

    it('prevent authenticated user with un-verified JAC email from updating a panellist', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false },
        { 'panellists/ux1': { } }
      );
      await assertFails(db.collection('panellists').doc('ux1').update(newPanellistData));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to update a panellist with missing data', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'panellists/ux1': { } }
      );
      await assertFails(db.collection('panellists').doc('ux1').update(newPanellistData));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from updating a panellist', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'panellists/ux1': { } }
      );
      await assertFails(db.collection('panellists').doc('ux1').update(newPanellistData));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from updating a panellist', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'panellists/ux1': { } }
      );
      await assertFails(db.collection('panellists').doc('ux1').update(newPanellistData));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to change a panellist', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.panellists.permissions.canManagePanellists.value] },
        { 'panellists/ux1': { } }
      );
      await assertSucceeds(db.collection('panellists').doc('ux1').update(newPanellistData));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting a panellist', async () => {
      const db = await setup();
      await assertFails(db.collection('panellists').doc('ux1').delete());
    });

    it('prevent authenticated user from deleting a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('panellists').doc('ux1').delete());
    });

    it('prevent authenticated user with verified email from deleting a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('panellists').doc('ux1').delete());
    });

    it('prevent authenticated user with un-verified JAC email from deleting a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('panellists').doc('ux1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from deleting a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('panellists').doc('ux1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permisssion from deleting a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('panellists').doc('ux1').delete());
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to delete a panellist', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.panellists.permissions.canManagePanellists.value] });
      await assertSucceeds(db.collection('panellists').doc('ux1').delete());
    });
  });

});
