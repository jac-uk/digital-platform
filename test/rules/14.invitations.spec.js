import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

describe('Invitations', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent JAC admin without permission from creating invitations', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('invitations').add({}));
    });

    it('allow JAC admin with permission to create invitations', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.invitations.permissions.canCreateInvitations.value] });
      await assertSucceeds(db.collection('invitations').add({}));
    });
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading invitations', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('invitations').get());
    });

    it('allow JAC admin with permission to read invitations', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.invitations.permissions.canReadInvitations.value] });
      await assertSucceeds(db.collection('invitations').get());
    });
  });

  context('Update', () => {
    it('prevent JAC admin without permission from updating invitations', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'invitations/invitation1': {} }
      );
      await assertFails(db.collection('invitations').doc('invitation1').update({}));
    });

    it('allow JAC admin with permission to update invitations', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.invitations.permissions.canUpdateInvitations.value] },
        { 'invitations/invitation1': {} }
      );
      await assertSucceeds(db.collection('invitations').doc('invitation1').update({}));
    });
  });

  context('Delete', () => {
    it('prevent JAC admin without permission from deleting invitations', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'invitations/invitation1': {} }
      );
      await assertFails(db.collection('invitations').doc('invitation1').delete());
    });

    it('allow JAC admin with permission to delete invitations', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.invitations.permissions.canDeleteInvitations.value] },
        { 'invitations/invitation1': {} }
      );
      await assertSucceeds(db.collection('invitations').doc('invitation1').delete());
    });
  });

});
