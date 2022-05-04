const { setup, teardown } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

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
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['i2'] });
      await assertSucceeds(db.collection('invitations').add({}));
    });
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading invitations', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('invitations').get());
    });

    it('allow JAC admin with permission to read invitations', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['i1'] });
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
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['i3'] },
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
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['i4'] },
        { 'invitations/invitation1': {} }
      );
      await assertSucceeds(db.collection('invitations').doc('invitation1').delete());
    });
  });

});
