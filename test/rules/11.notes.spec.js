const { setup, teardown } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

describe('Notes', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent JAC admin without permission from creating notes', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('notes').add({ body: '', createdBy: '' }));
    });

    it('allow JAC admin with permission to create notes', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['nt2'] });
      await assertSucceeds(db.collection('notes').add({ body: '', createdBy: '' }));
    });
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading notes', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('notes').get());
    });

    it('allow JAC admin with permission to read notes', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['nt1'] });
      await assertSucceeds(db.collection('notes').get());
    });
  });

  context('Update', () => {
    it('prevent JAC admin without permission from updating notes', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'notes/note1': {} }
      );
      await assertFails(db.collection('notes').doc('note1').update({ body: '', createdBy: '' }));
    });

    it('allow JAC admin with permission to update notes', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['nt3'] },
        { 'notes/note1': {} }
      );
      await assertSucceeds(db.collection('notes').doc('note1').update({ body: '', createdBy: '' }));
    });
  });

  context('Delete', () => {
    it('prevent JAC admin without permission from deleting notes', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'notes/note1': {} }
      );
      await assertFails(db.collection('notes').doc('note1').delete());
    });

    it('allow JAC admin with permission to delete notes', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['nt4'] },
        { 'notes/note1': {} }
      );
      await assertSucceeds(db.collection('notes').doc('note1').delete());
    });
  });

});
