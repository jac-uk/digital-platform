const { setup, teardown } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

describe('Candidates', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent un-authenticated user from creating a candidate', async () => {
      const db = await setup();
      await assertFails(db.collection('candidates').add({}));
    });
    it('prevent authenticated user from creating a random candidate', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('candidates').add({}));
    });
    it('allow authenticated user to create own candidate', async () => {
      const db = await setup({ uid: 'user1' });
      await assertSucceeds(db.collection('candidates').doc('user1').set({}));
    });
    it('allow authenticated JAC user to create candidate', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true });
      await assertSucceeds(db.collection('candidates').doc('random').set({}));
    });
    it('allow authenticated JAC user to create candidate documents', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true });
      await assertSucceeds(db.doc('candidates/random/documents/personalDetails').set({}));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading candidate data', async () => {
      const db = await setup();
      await assertFails(db.collection('candidates').get());
    });

    it('prevent authenticated user from reading candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('candidates').get());
    });

    it('allow authenticated user to read their own candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertSucceeds(db.doc('candidates/user1').get());
    });

    it('prevent authenticated user from reading anothers candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.doc('candidates/user2').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating candidate data', async () => {
      const db = await setup();
      await assertFails(db.collection('candidates').doc('user1').update({}));
    });
    it('prevent authenticated user from updating someone elses candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('candidates').doc('user2').update({}));
    });
    it('allow authenticated user to update own candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertSucceeds(db.collection('candidates').doc('user1').update({}));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting a candidate', async () => {
      const db = await setup();
      await assertFails(db.collection('candidates').doc('user1').delete());
    });
    it('prevent authenticated user from deleting someone elses candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('candidates').doc('user2').delete());
    });
    it('prevent authenticated user from deleting own candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('candidates').doc('user1').delete());
    });
  });

});
